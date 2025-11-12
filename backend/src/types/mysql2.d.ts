declare module 'mysql2/promise' {
  import { Pool, PoolOptions, PoolConnection, RowDataPacket, FieldPacket } from 'mysql2';
  
  export function createPool(config: PoolOptions): Pool;
  export * from 'mysql2';
}
