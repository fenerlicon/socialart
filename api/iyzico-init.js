import Iyzipay from 'iyzipay';

export default async function handler(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planName, price, buyerInfo } = req.body || {};

    if (!price || !buyerInfo?.name) {
      return res.status(400).json({ error: 'Lütfen ad soyad ve gerekli bilgileri doldurun.' });
    }

    // Email format validation (only if email is provided)
    const emailProvided = buyerInfo?.email && String(buyerInfo.email).trim();
    if (emailProvided) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(buyerInfo.email).trim())) {
        return res.status(400).json({ error: 'Lütfen geçerli bir e-posta adresi giriniz (Örn: isim@firma.com) veya boş bırakınız.' });
      }
    }
    const finalEmail = emailProvided ? String(buyerInfo.email).trim() : 'musteri@socialartmedya.com';

    const rawApiKey = process.env.IYZICO_API_KEY;
    const rawSecretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

    // iyzico API credentials configuration
    const iyzipay = new Iyzipay({
      apiKey: rawApiKey,
      secretKey: rawSecretKey,
      uri: baseUrl
    });

    // Safe price parser (handles 146.000,00 and 175200.00 without multiplying by 100)
    const rawPriceStr = String(price || '0').replace(/[^0-9.,]/g, '').trim();
    let normalizedPriceStr = rawPriceStr;

    if (rawPriceStr.includes(',') && rawPriceStr.includes('.')) {
      if (rawPriceStr.indexOf('.') < rawPriceStr.indexOf(',')) {
        normalizedPriceStr = rawPriceStr.replace(/\./g, '').replace(',', '.');
      } else {
        normalizedPriceStr = rawPriceStr.replace(/,/g, '');
      }
    } else if (rawPriceStr.includes(',')) {
      normalizedPriceStr = rawPriceStr.replace(',', '.');
    } else if ((rawPriceStr.match(/\./g) || []).length > 1) {
      normalizedPriceStr = rawPriceStr.replace(/\./g, '');
    }

    const numericPrice = parseFloat(normalizedPriceStr);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Geçersiz fiyat tutarı.' });
    }

    const formattedPrice = numericPrice.toFixed(2);
    const conversationId = `SOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const host = req.headers.host || 'www.socialartmedya.com';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const siteUrl = process.env.VITE_SITE_URL || `${protocol}://${host}`;
    const callbackUrl = `${siteUrl}/api/iyzico-callback`;

    // Split name into first and last name if provided together
    const fullNameParts = String(buyerInfo.name).trim().split(' ');
    const firstName = fullNameParts[0] || 'Müşteri';
    const lastName = fullNameParts.slice(1).join(' ') || firstName;

    // Clean phone number (numeric and leading + only)
    const cleanPhone = String(buyerInfo.phone || '+905000000000').replace(/[^0-9+]/g, '');
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+90${cleanPhone.replace(/^0/, '')}`;

    // Basket item splitting logic for prices >= 100,000 TL
    // iyzico limits single basket item to < 100,000.00 TL
    const MAX_ITEM_PRICE = 95000;
    const basketItems = [];

    if (numericPrice <= MAX_ITEM_PRICE) {
      basketItems.push({
        id: `ITM-${Date.now()}`,
        name: planName || 'SocialArt Dijital Hizmet Paketi',
        category1: 'Dijital Hizmetler',
        category2: 'Sosyal Medya ve Prodüksiyon',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: formattedPrice
      });
    } else {
      const partsCount = Math.ceil(numericPrice / MAX_ITEM_PRICE);
      const equalPartPrice = Math.floor((numericPrice / partsCount) * 100) / 100;
      let accumulated = 0;

      for (let i = 0; i < partsCount; i++) {
        const isLast = i === partsCount - 1;
        const itemVal = isLast ? (numericPrice - accumulated) : equalPartPrice;
        accumulated += itemVal;
        const itemPriceFormatted = itemVal.toFixed(2);

        basketItems.push({
          id: `ITM-${Date.now()}-${i + 1}`,
          name: `${planName || 'SocialArt Dijital Hizmet Paketi'} (Bölüm ${i + 1}/${partsCount})`,
          category1: 'Dijital Hizmetler',
          category2: 'Sosyal Medya ve Prodüksiyon',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: itemPriceFormatted
        });
      }
    }

    const requestData = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: formattedPrice,
      paidPrice: formattedPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `BSK-${conversationId}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: callbackUrl,
      enabledInstallments: [1, 2, 3, 6],
      buyer: {
        id: `BYR-${Date.now()}`,
        name: firstName,
        surname: lastName,
        gsmNumber: formattedPhone,
        email: finalEmail,
        identityNumber: buyerInfo.identityNumber || '11111111111',
        registrationAddress: buyerInfo.address || 'İstanbul, Türkiye',
        ip: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '85.105.0.1').split(',')[0].trim(),
        city: buyerInfo.city || 'İstanbul',
        country: 'Turkey'
      },
      shippingAddress: {
        contactName: `${firstName} ${lastName}`.trim(),
        city: buyerInfo.city || 'İstanbul',
        country: 'Turkey',
        address: buyerInfo.address || 'İstanbul, Türkiye'
      },
      billingAddress: {
        contactName: `${firstName} ${lastName}`.trim(),
        city: buyerInfo.city || 'İstanbul',
        country: 'Turkey',
        address: buyerInfo.address || 'İstanbul, Türkiye'
      },
      basketItems: basketItems
    };

    iyzipay.checkoutFormInitialize.create(requestData, (err, result) => {
      if (err) {
        console.error('Iyzico Init Error:', err);
        return res.status(500).json({ error: 'iyzico bağlantı hatası oluştu', details: String(err) });
      }

      if (result.status !== 'success') {
        console.error('Iyzico Result Error:', result);
        return res.status(400).json({
          error: result.errorMessage || 'Ödeme formu başlatılamadı.',
          errorCode: result.errorCode
        });
      }

      return res.status(200).json({
        status: 'success',
        token: result.token,
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl,
        conversationId: conversationId
      });
    });

  } catch (error) {
    console.error('iyzico handler error:', error);
    return res.status(500).json({ error: error.message || 'Sunucu hatası' });
  }
}
