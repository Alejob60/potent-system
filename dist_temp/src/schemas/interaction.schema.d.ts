/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferhydrateddoctype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import { Document } from 'mongoose';
export type InteractionDocument = Interaction & Document;
export declare class Interaction {
    tenantId: string;
    userId: string;
    channel: string;
    content: string;
    role: string;
    embedding: number[];
    metadata: {
        timestamp?: Date;
        sentiment?: {
            score: number;
            label: string;
        };
        urgency?: 'low' | 'medium' | 'high';
        intent?: string;
        entities?: Record<string, any>;
        sessionId?: string;
        messageId?: string;
        contextTags?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const InteractionSchema: import("mongoose").Schema<Interaction, import("mongoose").Model<Interaction, any, any, any, (Document<unknown, any, Interaction, any, import("mongoose").DefaultSchemaOptions> & Interaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Interaction, any, import("mongoose").DefaultSchemaOptions> & Interaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Interaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Interaction, Document<unknown, {}, Interaction, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    tenantId?: import("mongoose").SchemaDefinitionProperty<string, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    channel?: import("mongoose").SchemaDefinitionProperty<string, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    role?: import("mongoose").SchemaDefinitionProperty<string, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    embedding?: import("mongoose").SchemaDefinitionProperty<number[], Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<{
        timestamp?: Date | undefined;
        sentiment?: {
            score: number;
            label: string;
        } | undefined;
        urgency?: "low" | "medium" | "high" | undefined;
        intent?: string | undefined;
        entities?: Record<string, any> | undefined;
        sessionId?: string | undefined;
        messageId?: string | undefined;
        contextTags?: string[] | undefined;
    }, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Interaction, Document<unknown, {}, Interaction, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Interaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Interaction>;
