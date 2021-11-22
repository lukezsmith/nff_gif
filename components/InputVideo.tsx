type VideoProps = {
    videoURL: string;
  };
export const InputVideo = ({ videoURL }:VideoProps ) => {
    console.log("in input ideo")
    return <video controls crossorigin="anonymous" width="250" src={videoURL} />;
  };