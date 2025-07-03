import { JSONSchema, Model } from "objection";

class Config extends Model {
    static idColumn: string = "id";
    static tableName: string = "configs";

    id!: number;
    chat_id!: string;
    config_mobileconfig!: string;
    config_p12!: string;
    config_sswan!: string;
    valid_until_date!: string;
    created_at!: string;

    static jsonSchema: JSONSchema = {
        type: "object",
        required: [
            "chat_id",
            "config_mobileconfig",
            "config_p12",
            "config_sswan",
            "valid_until_date",
        ],
        properties: {
            id: { type: "integer" },
            chat_id: { type: "string" },
            config_mobileconfig: { type: "string", contentEncoding: "base64" },
            config_p12: { type: "string", contentEncoding: "base64" },
            config_sswan: { type: "string", contentEncoding: "base64" },
            valid_until_date: { type: "string", format: "date-time" },
            created_at: { type: "string", format: "date-time" },
        },
    };
}

export default Config;
