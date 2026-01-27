import type { FieldUnit } from "./interfaces";

export type GameStatus = "playing" | "victory" | "defeat";

// 필드의 슬롯을 5개로 고정
export type Field = [FieldUnit | null, FieldUnit | null, FieldUnit | null, FieldUnit | null, FieldUnit | null];
