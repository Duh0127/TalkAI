import { Request, Response } from "express";

type EventStreamPack = {
    type: string;
    content?: unknown;
};

export class EventStream {
    private closed = false;
    private readonly onRequestClose = () => {
        this.closed = true;
        this.req.off("close", this.onRequestClose);
    };

    constructor(
        private readonly req: Request,
        private readonly res: Response
    ) {
        this.res.status(200);
        this.res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        this.res.setHeader("Cache-Control", "no-cache, no-transform");
        this.res.setHeader("Connection", "keep-alive");
        this.res.setHeader("X-Accel-Buffering", "no");
        this.res.flushHeaders?.();

        this.req.on("close", this.onRequestClose);
    }

    static from(req: Request, res: Response): EventStream {
        return new EventStream(req, res);
    }

    sendEvent(pack: EventStreamPack): void {
        if (this.isClosed()) return;

        const payload = JSON.stringify(pack);
        this.res.write(`data: ${payload}\n\n`);
    }

    sendDone(): void {
        if (this.isClosed()) return;
        this.res.write("data: [DONE]\n\n");
        this.close();
    }

    close(): void {
        this.req.off("close", this.onRequestClose);
        if (this.closed) return;

        this.closed = true;

        if (!this.res.writableEnded) {
            this.res.end();
        }
    }

    isClosed(): boolean {
        return this.closed || this.req.aborted || this.res.writableEnded;
    }
}

export type { EventStreamPack };
