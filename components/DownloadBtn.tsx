type DownloadProps = {
    gif: string;
    download: (event: React.MouseEvent<HTMLElement>) => void;
  };

export const DownloadBtn = ({ gif, download }:DownloadProps) => {
    return (
      <a className="cursor-pointer p-3 bg-gray-300 rounded-md hover:bg-gray-400" href={gif} download onClick={(e) => download(e)}>
        Download
      </a>
    );
  };