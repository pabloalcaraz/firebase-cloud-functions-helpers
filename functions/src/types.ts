export interface Response {
  data?: any;
  errorMessage?: string;
  error?: any;
}

type extensions = "jpg" | "png";

export interface ImgProps {
  text: string;
  folder?: string;
  extension?: extensions;
  upload?: boolean;
}
