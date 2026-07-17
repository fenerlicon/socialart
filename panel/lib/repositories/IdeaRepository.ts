import { supabase } from '@/lib/supabase/client'
import type { Idea } from '@/types/domain'
import { v4 as uuidv4 } from 'uuid'

export const IdeaRepository = {
  mapRowToIdea(row: any): Idea {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      brandId: row.brand_id,
      creatorId: row.creator_id,
      votes: row.votes,
      votedEmployeeIds: row.voted_employee_ids || [],
      status: row.status,
      impact: row.impact,
      createdAt: row.created_at,
    }
  },

  mapIdeaToRow(idea: Partial<Idea>) {
    const row: any = {}
    if (idea.id !== undefined) row.id = idea.id
    if (idea.title !== undefined) row.title = idea.title
    if (idea.description !== undefined) row.description = idea.description
    if (idea.category !== undefined) row.category = idea.category
    if (idea.brandId !== undefined) row.brand_id = idea.brandId
    if (idea.creatorId !== undefined) row.creator_id = idea.creatorId
    if (idea.votes !== undefined) row.votes = idea.votes
    if (idea.votedEmployeeIds !== undefined) row.voted_employee_ids = idea.votedEmployeeIds
    if (idea.status !== undefined) row.status = idea.status
    if (idea.impact !== undefined) row.impact = idea.impact
    if (idea.createdAt !== undefined) row.created_at = idea.createdAt
    return row
  },

  async getAll(): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ideas:', error)
      throw error
    }

    return (data || []).map(this.mapRowToIdea)
  },

  async getById(id: string): Promise<Idea | null> {
    if (!id) return null
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching idea with id ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToIdea(data) : null
  },

  async save(idea: Idea): Promise<Idea> {
    const row = this.mapIdeaToRow(idea)
    row.updated_at = new Date().toISOString()
    const { error } = await supabase
      .from('ideas')
      .upsert(row)

    if (error) {
      console.error('Error saving idea:', error)
      throw error
    }

    return idea
  },

  async saveMultiple(ideas: Idea[]): Promise<void> {
    const rows = ideas.map((idea) => {
      const row = this.mapIdeaToRow(idea)
      row.updated_at = new Date().toISOString()
      return row
    })
    const { error } = await supabase
      .from('ideas')
      .upsert(rows)

    if (error) {
      console.error('Error saving multiple ideas:', error)
      throw error
    }
  },

  async create(input: Omit<Idea, 'id' | 'votes' | 'votedEmployeeIds' | 'status' | 'createdAt'>): Promise<Idea> {
    const now = new Date().toISOString()
    const newIdea: Idea = {
      ...input,
      id: uuidv4(),
      votes: 0,
      votedEmployeeIds: [],
      status: 'pending',
      createdAt: now,
    }

    const row = this.mapIdeaToRow(newIdea)
    row.updated_at = now
    const { error } = await supabase
      .from('ideas')
      .insert(row)

    if (error) {
      console.error('Error creating idea:', error)
      throw error
    }

    return newIdea
  },

  async update(id: string, fields: Partial<Omit<Idea, 'id' | 'createdAt'>>, actorId?: string): Promise<Idea | null> {
    const row = this.mapIdeaToRow(fields)
    row.updated_at = new Date().toISOString()
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabase
      .from('ideas')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating idea ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToIdea(data) : null
  },

  async toggleVote(id: string, employeeId: string): Promise<Idea | null> {
    const idea = await this.getById(id)
    if (!idea) return null

    const votedIds = [...idea.votedEmployeeIds]
    const hasVoted = votedIds.includes(employeeId)
    let newVotes = idea.votes

    let updatedVotedIds: string[]
    if (hasVoted) {
      updatedVotedIds = votedIds.filter((eId) => eId !== employeeId)
      newVotes = Math.max(0, newVotes - 1)
    } else {
      updatedVotedIds = [...votedIds, employeeId]
      newVotes += 1
    }

    return this.update(id, {
      votedEmployeeIds: updatedVotedIds,
      votes: newVotes,
    })
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting idea ${id}:`, error)
      throw error
    }
  }
}
