declare module "promisepipe" {
  import { Stream } from "stream";

  const pipe: (readableStream: Stream, writeableStream: Stream) => [Stream, Stream];

  export = pipe;
}
