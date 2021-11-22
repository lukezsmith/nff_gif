type DownloadProps = {
    gif: string;
    download: (event: React.MouseEvent<HTMLElement>) => void;
  };

export const DownloadBtn = ({ gif, download }:DownloadProps) => {
    return (
      <button className="my-5 p-3 bg-gray-300 rounded-md hover:bg-gray-400" href={gif} download onClick={(e) => download(e)}>
        Download
      </button>
    );
  };