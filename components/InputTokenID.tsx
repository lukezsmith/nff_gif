
type TokenIDProps = {
    setVideo: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
export const InputTokenID = ({ setVideo }:TokenIDProps) => {
    return (
      <div>
        <input type="file" onChange={(e) => 
        // setVideo(e.target.files?.item(0))
        console.log("test")
        } />
      </div>
    );
  };