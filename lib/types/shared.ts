// Shared types for page components
export type PageParams = Promise<{ [key: string]: string }>;
export type PageSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

// Shared types for animation components
export type RoutePoint = {
  x: number;
  y: number;
  delay?: number;
};

export type DOT = {
  x: number;
  y: number;
  radius?: number;
  opacity?: number;
  id?: string;
};
