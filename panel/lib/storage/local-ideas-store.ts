import type { Idea } from '@/types/domain'
import { IdeaRepository } from '@/lib/repositories/IdeaRepository'

export async function getStoredIdeas(): Promise<Idea[]> {
  return IdeaRepository.getAll()
}

export async function saveIdeas(ideas: Idea[]): Promise<void> {
  await IdeaRepository.saveMultiple(ideas)
}

export async function createIdea(
  input: Omit<Idea, 'id' | 'votes' | 'votedEmployeeIds' | 'status' | 'createdAt'>
): Promise<Idea> {
  return IdeaRepository.create(input)
}

export async function updateIdea(
  id: string,
  fields: Partial<Omit<Idea, 'id' | 'createdAt'>>
): Promise<Idea | undefined> {
  const idea = await IdeaRepository.update(id, fields)
  return idea || undefined
}

export async function toggleVoteIdea(id: string, employeeId: string): Promise<Idea | undefined> {
  const idea = await IdeaRepository.toggleVote(id, employeeId)
  return idea || undefined
}

export async function deleteIdea(id: string): Promise<void> {
  await IdeaRepository.delete(id)
}

export type { Idea }
