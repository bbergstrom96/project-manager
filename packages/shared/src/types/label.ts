export interface Label {
  id: string;
  name: string;
  color: string;
  isFavorite: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
  isFavorite?: boolean;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  isFavorite?: boolean;
  order?: number;
}
