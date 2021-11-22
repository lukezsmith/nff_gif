type GifProps = {
    gif: string;
  };
export const Gif = ({ gif }:GifProps) => {
    return <img src={gif} />;
  };