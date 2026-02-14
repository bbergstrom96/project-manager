export interface Routine {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  order: number;
  isArchived: boolean;
  variant: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineSection {
  id: string;
  name: string;
  order: number;
  routineId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineItem {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isTrackable: boolean;
  sectionId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineItemCompletion {
  id: string;
  itemId: string;
  routineDate: string;
  completedAt: Date;
}

// Nested types for API responses
export interface RoutineItemWithCompletion extends RoutineItem {
  isCompleted: boolean;
  subItems?: RoutineItemWithCompletion[];
}

export interface RoutineSectionWithItems extends RoutineSection {
  items: RoutineItemWithCompletion[];
}

export interface RoutineWithSections extends Routine {
  sections: RoutineSectionWithItems[];
}

// Input types
export interface CreateRoutineInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateRoutineInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  isArchived?: boolean;
  order?: number;
}

export interface CreateRoutineSectionInput {
  name: string;
}

export interface UpdateRoutineSectionInput {
  name?: string;
  order?: number;
}

export interface CreateRoutineItemInput {
  name: string;
  description?: string;
  isTrackable?: boolean;
  parentId?: string;
}

export interface UpdateRoutineItemInput {
  name?: string;
  description?: string | null;
  isTrackable?: boolean;
  order?: number;
  sectionId?: string;
  parentId?: string | null;
}
