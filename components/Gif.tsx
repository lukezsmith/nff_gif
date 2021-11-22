type GifProps = {
    gif: string;
  };
export const Gif = ({ gif }:GifProps) => {
    return <img id="gif" src={gif} />;
  };