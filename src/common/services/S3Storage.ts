import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { FileData, FileStorage } from "../types/storage";
import config from "config";

export class S3Storage implements FileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: config.get("S3.region"),
            credentials: {
                accessKeyId: config.get("S3.accessKey"),
                secretAccessKey: config.get("S3.secretKey"),
            },
        });
    }

    async upload(data: FileData): Promise<void> {
        const objectParams = {
            Bucket: config.get("S3.bucket"),
            Key: data.filename,
            Body: data.fileData,
        };
        //@ts-ignore
        await this.client.send(new PutObjectCommand(objectParams));
    }

    async delete(filename: string): Promise<void> {
        const objectParams = {
            Bucket: config.get("S3.bucket"),
            Key: filename,
        };
        //@ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }
}
