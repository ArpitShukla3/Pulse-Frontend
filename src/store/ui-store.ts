import { create } from 'zustand'

type Note = {
  id: string
  title: string
  description: string
}

type UiStore = {
  notes: Note[]
  addSampleNote: () => void
}

const initialNotes: Note[] = [
  {
    id: 'router',
    title: 'Router ready',
    description: 'Nested routes are configured with a dedicated fallback page.',
  },
  {
    id: 'theme',
    title: 'Theme ready',
    description: 'Dark and light mode styles are wired through CSS variables.',
  },
]

export const useUiStore = create<UiStore>((set, get) => ({
  notes: initialNotes,
  addSampleNote: () => {
    const count = get().notes.length + 1

    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: `note-${count}`,
          title: `Sample item ${count}`,
          description: 'This item was added from the shared Zustand store.',
        },
      ],
    }))
  },
}))
