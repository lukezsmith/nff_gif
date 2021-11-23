type DownloadProps = {
    url: string;
    download: (event: React.MouseEvent<HTMLElement>, s: string) => void;
    type: string
  };

export const DownloadBtn = ({ url, download, type }:DownloadProps) => {
    return (
      <a className="cursor-pointer p-3 bg-gray-300 rounded-md hover:bg-gray-400" href={url} download onClick={(e) => download(e, type)}>
        Download
      </a>
    );
  };