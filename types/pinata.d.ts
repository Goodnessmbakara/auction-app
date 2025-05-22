declare module '@pinata/sdk' {
    interface PinListResponse {
      rows: Array<{
        ipfs_pin_hash: string;
        metadata?: {
          keyvalues?: {
            type?: string;
            endTime?: string; // Enforce string type
          };
        };
      }>;
    }
  }