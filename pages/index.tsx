import type { NextPage } from "next";
import Head from "next/head";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useState } from "react";
import { DownloadBtn } from "../components/DownloadBtn";
import { Gif } from "../components/Gif";
import ClipLoader from "react-spinners/ClipLoader";
import Switch from "react-switch";
import captureVideoFrame from "capture-video-frame";

const ffmpeg = createFFmpeg({ log: true });

const ipfsURL =
  "https://ipfs.io/ipfs/QmUZxB4PmiwWa524ScscBsXiMhnLHAsB6N9JHtM4jv5Ppu/";

async function extractFramesFromVideo(videoUrl: string, fps = 30) {
  return new Promise(async (resolve) => {
    // fully download it first (no buffering):
    let videoBlob = await fetch(videoUrl).then((r) => r.blob());
    let videoObjectUrl = URL.createObjectURL(videoBlob);
    let video = document.createElement("video");

    // let seekResolve: { (): void; (value: unknown): void; };
    let seekResolve: (value: unknown) => void;
    video.addEventListener("seeked", async function () {
      if (seekResolve) seekResolve(null);
    });

    video.src = videoObjectUrl;

    // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
    while (
      (video.duration === Infinity || isNaN(video.duration)) &&
      video.readyState < 2
    ) {
      await new Promise((r) => setTimeout(r, 500));
      video.currentTime = 10000000 * Math.random();
    }
    let duration = video.duration / 3;

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let [w, h] = [video.videoWidth, video.videoHeight];
    canvas.width = w;
    canvas.height = h;

    video.currentTime = 22.5 * (1 / fps);
    await new Promise((r) => (seekResolve = r));
    context!.drawImage(video, 0, 0, w, h);
    let base64ImageData = canvas.toDataURL();
    let frame = base64ImageData;
    resolve(frame);
  });
}

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [compatible, setCompatible] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [gif, setGif] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [gifDuration, setGifDuration] = useState("2.2");
  const [reversed, setReversed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [isMire, setisMireable] = useState(false);
  const [headTrait, setHeadTrait] = useState("");

  const load = async () => {
    var isSafari = (function (p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(
      !window["safari" as keyof Window] ||
        window["safari" as keyof Window].pushNotification
    );

    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isSafari || isMobile) {
      setCompatible(false);
      setLoading(false);
      return;
    }else {
      await ffmpeg.load();
      setCompatible(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getVideoURL = async (e: string) => {
    setVideoLoading(true);
    let tokenId = parseInt(e);
    if (tokenId < 0 || tokenId > 10000 || isNaN(tokenId)) {
      alert("Invalid id!");
      setVideoLoading(false);
      return;
    }
    fetch(ipfsURL + e + ".json").then(function (response) {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status Code: " + response.status
        );
        setVideoLoading(false);
        return;
      }

      // Examine the text in the response
      response.json().then(function (data) {
        // get url
        let videoUrl =
          "https://ipfs.io/ipfs/" +
          data.image.split("/")[2] +
          "/" +
          data.image.split("/")[3];
        setVideoURL(videoUrl);

        let index = data.attributes.findIndex(
          (x: { trait_type: string }) => x.trait_type === "Species"
        );
        if (data.attributes[index].value === "mire-able") {
          setisMireable(true);

          // check for head traits
          if (
            data.attributes.some(
              (x: { value: string }) => x.value === "smoking pipe"
            )
          ) {
            setHeadTrait("pipe");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "lodged cigarette"
            )
          ) {
            setHeadTrait("cig");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "lodged sawblade"
            )
          ) {
            setHeadTrait("saw");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "lodged bitcoin"
            )
          ) {
            setHeadTrait("btc");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "lodged ether"
            )
          ) {
            setHeadTrait("eth");
          } else {
            setHeadTrait("");
          }
        } else {
          setisMireable(false);
          // setHeadTrait("");
          // check for head traits
          if (
            data.attributes.some((x: { value: string }) =>
              x.value.includes("leaf")
            )
          ) {
            setHeadTrait("leaf");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "goggles"
            )
          ) {
            setHeadTrait("goggles");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "lodged sushi knife"
            )
          ) {
            setHeadTrait("knife");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "top hat"
            )
          ) {
            setHeadTrait("top hat");
          } else if (
            data.attributes.some(
              (x: { value: string }) => x.value === "aviators"
            )
          ) {
            setHeadTrait("aviators");
          } else {
            setHeadTrait("");
          }
        }
        setGifDuration(
          data.attributes[index].value === "mire-able" ? "2" : "2.2"
        );
        setVideoLoading(false);
      });
    });
  };

  const convertToGif = async () => {
    setConversionLoading(true);
    // Write the .mp4 to the FFmpeg file system
    ffmpeg.FS("writeFile", "video1.mp4", await fetchFile(videoURL));

    let gifConfig = "";

    if (!reversed) {
      if (!flipped) {
        gifConfig =
          "fps=45,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
      } else {
        gifConfig =
          "hflip,fps=45,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
      }
    } else {
      if (!flipped) {
        gifConfig =
          "fps=45,reverse, scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
      } else {
        gifConfig =
          "hflip,reverse, fps=45,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
      }
    }

    // Run the FFmpeg command-line tool, converting
    // the .mp4 into .gif file
    await ffmpeg.run(
      "-i",
      "video1.mp4",
      "-t",
      "2.2",
      "-vf",
      gifConfig,
      "out.gif"
    );
    // Read the .gif file back from the FFmpeg file system
    const data = ffmpeg.FS("readFile", "out.gif");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setConversionLoading(false);
    setGif(url);
  };

  const generatePFP = async () => {
    setConversionLoading(true);

    let frame;
    var temp = new Image();
    temp.className = "pfp-hidden";

    if (isMire) {
      frame = captureVideoFrame("vid", "png", 1);
      temp.src = frame.dataUri;
    } else {
      frame = await extractFramesFromVideo(videoURL);
      temp.src = String(frame);
    }
    setTimeout(() => {
      var canvas = document.createElement("canvas") as HTMLCanvasElement;
      canvas.width = 500;
      canvas.height = 500;
      var canvasContext = canvas.getContext("2d");

      canvasContext!.translate(500, 0);
      canvasContext!.scale(-1, 1);

      // MIRE SETTINGS
      if (isMire) {
        switch (headTrait) {
          case "pipe":
            // 5792
            canvasContext!.scale(1.4, 1.4);
            canvasContext!.drawImage(temp, -35, 0, 500, 500);
            break;
          case "cig":
            // 235
            canvasContext!.scale(1.5, 1.5);
            canvasContext!.drawImage(temp, -70, 0, 500, 500);
            break;
          case "saw":
            // 8181
            canvasContext!.scale(1.45, 1.45);
            canvasContext!.drawImage(temp, -70, 0, 500, 500);
            break;
          case "btc":
            // 1405
            canvasContext!.scale(1.5, 1.5);
            canvasContext!.drawImage(temp, -75, 0, 500, 500);
            break;
          case "eth":
            // 4087
            canvasContext!.scale(1.45, 1.45);
            canvasContext!.drawImage(temp, -85, 0, 500, 500);
            break;
          default:
            canvasContext!.scale(1.65, 1.65);
            canvasContext!.drawImage(temp, -85, 0, 500, 500);
            break;
        }
      } else {
        // BOG SETTINGS
        switch (headTrait) {
          case "leaf":
            // 8856
            canvasContext!.scale(1.3, 1.3);
            // canvasContext!.fillRect(0, 0, 500,500);
            canvasContext!.drawImage(temp, -75, 0, 500, 500);
            break;
          case "goggles":
            // 5928
            canvasContext!.scale(1.25, 1.25);
            canvasContext!.drawImage(temp, -65, -5, 500, 500);
            break;
          case "knife":
            // 4747
            canvasContext!.scale(1.2, 1.2);
            canvasContext!.drawImage(temp, -55, 10, 500, 500);
            break;
          case "top hat":
            // 9982
            canvasContext!.scale(1.2, 1.2);
            canvasContext!.drawImage(temp, -55, 10, 500, 500);
            break;
          case "aviators":
            // 1851
            canvasContext!.scale(1.25, 1.25);
            canvasContext!.drawImage(temp, -65, -5, 500, 500);
            break;
          default:
            canvasContext!.scale(1.3, 1.3);
            canvasContext!.drawImage(temp, -75, -40, 500, 500);
            break;
        }
      }
      setConversionLoading(false);
      setGif(canvas.toDataURL("image/png"));
      canvas.remove();
      temp.remove();
      return;
    }, 1000);
  };

  const download = (e: React.MouseEvent, type: string) => {
    fetch((e.target as HTMLAnchorElement).href, {
      method: "GET",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          if (type === "gif") {
            link.setAttribute("download", "image.gif");
          } else {
            link.setAttribute("download", "video.mp4");
          }
          document.body.appendChild(link);
          // link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  if (loading) {
    return (
      <div
        style={{marginTop: "12%"}}
        id="main"
        className="bg-white text-center flex flex-col items-center"
      >
        <ClipLoader loading={true} />
      </div>
    );
  }
  return compatible ? (
    <div id="main" className="bg-white text-center flex flex-col items-center">
      <Head>
        <title>Non Fungible Fungi GIF Generator</title>
        <meta
          name="description"
          content="View your Shroom & Generate a downloadable GIF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-lg lg:text-4xl bold my-10 ">
        🍄 Non Fungible Fungi GIF Generator 🍄
      </h1>
      <div className="invisible sm:visible grid grid-cols-2 mx-2 lg:mx-64 bg-gray-100 rounded-xl lg:p-8">
        <div className="grid-rows-3 mx-10 lg:mx-20 my-10 lg:my-0 flex flex-col justify-center">
          <div className="">
            <h1 className="text-md lg:text-xl bold">Enter TokenID: </h1>
            <input
              id="token-input"
              placeholder="Enter your TokenID here..."
              className="bg-gray-300 p-1 placeholder-gray-800::placeholder my-5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // setVideoLoading(true);
                  getVideoURL((e.target as HTMLTextAreaElement).value);
                }
              }}
            ></input>
            <button
              className="cursor-pointer rounded-none ml-2 p-1 bg-gray-300 rounded-md hover:bg-gray-400"
              onClick={() =>
                getVideoURL(
                  (document.getElementById("token-input") as HTMLInputElement)!
                    .value
                )
              }
            >
              Enter
            </button>
          </div>
          {videoURL !== "" ? (
            <div>
              <div className="lg:my-10">
                <ClipLoader loading={videoLoading} />
                <video
                  id="vid"
                  controls
                  crossOrigin="anonymous"
                  src={videoURL}
                />
              </div>
              <div className="grid grid-cols-2">
                <div className=" my-3 lg:my-0 ">
                  {/* video download btn */}
                  {/* <DownloadBtn url={videoURL} type="video" download={download} />{" "} */}
                  <a
                    className="cursor-pointer p-3 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={convertToGif}
                  >
                    Convert to GIF
                  </a>
                </div>
                <div className=" my-3 lg:my-0 ">
                  {/* video download btn */}
                  {/* <DownloadBtn url={videoURL} type="video" download={download} />{" "} */}
                  <a
                    className="cursor-pointer p-3 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={generatePFP}
                  >
                    Generate PFP
                  </a>
                </div>
              </div>
              <label className="flex align-center justify-center lg:mt-10">
                <span>Moonwalking shroom?</span>
                <Switch
                  checkedIcon={false}
                  uncheckedIcon={false}
                  className="ml-5"
                  onChange={(e) => {
                    console.log(e);
                    if (reversed) {
                      setReversed(false);
                    } else {
                      setReversed(true);
                    }
                  }}
                  checked={reversed}
                />
              </label>
              <label className="flex align-center justify-center lg:mt-10">
                <span>Flipped shroom?</span>
                <Switch
                  checkedIcon={false}
                  uncheckedIcon={false}
                  className="ml-5"
                  onChange={(e) => {
                    console.log(e);
                    if (flipped) {
                      setFlipped(false);
                    } else {
                      setFlipped(true);
                    }
                  }}
                  checked={flipped}
                />
              </label>
            </div>
          ) : (
            <ClipLoader loading={videoLoading} />
          )}
        </div>
        <div className="grid-rows-3 mx-10 lg:mx-20 my-10 lg:my-0 flex flex-col justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-md lg:text-xl bold">Result: </h1>
            <ClipLoader loading={conversionLoading} />
            <input
              placeholder="result"
              className="invisible bg-gray-300 placeholder-gray-800::placeholder my-5"
            ></input>
          </div>
          {gif !== ""
            ? gif && (
                <div className="lg:my-10">
                  <Gif gif={gif} />
                </div>
              )
            : ""}
          {gif !== "" ? (
            <div>
              <div className=" my-3 lg:my-0 ">
                <DownloadBtn url={gif} type="gif" download={download} />{" "}
              </div>
              <label className="invisible flex align-center justify-center lg:mt-10">
                <span>Moonwalking shroom?</span>
                <Switch
                  checkedIcon={false}
                  uncheckedIcon={false}
                  className="ml-5"
                  onChange={(e) => {
                    console.log(e);
                    if (reversed) {
                      setReversed(false);
                    } else {
                      setReversed(true);
                    }
                  }}
                  checked={reversed}
                />
              </label>
              <label className="invisible flex align-center justify-center lg:mt-10">
                <span>Flipped shroom?</span>
                <Switch
                  checkedIcon={false}
                  uncheckedIcon={false}
                  className="ml-5"
                  onChange={(e) => {
                    console.log(e);
                    if (reversed) {
                      setReversed(false);
                    } else {
                      setReversed(true);
                    }
                  }}
                  checked={reversed}
                />
              </label>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="visible sm:invisible">
        This tool does not work on mobile unfortunately :(
      </div>
      <footer className="absolute bottom-5 right-5 text-xs text-gray-400">
        <a href="https://twitter.com/lukezsmith" className="underline">
          @lukezsmith
        </a>
      </footer>
    </div>
  ) : (
    <div className="bg-white text-center flex flex-col items-center">
      <Head>
        <title>🍄 Non Fungible Fungi GIF Generator 🍄</title>
        <meta
          name="description"
          content="View your Shroom & Generate a downloadable GIF"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-lg lg:text-4xl bold my-10 ">
        🍄 Non Fungible Fungi GIF Generator 🍄
      </h1>
      <div>
        {/* <h1 className="invisible sm:visible text-lg bold my-10 ">Loading...</h1> */}
      </div>
      <div className="visible">
        This tool does not work on mobile or Safari unfortunately :(
      </div>
      <footer className="absolute bottom-5 right-5 text-xs text-gray-400">
        <a href="https://twitter.com/lukezsmith" className="underline">
          @lukezsmith
        </a>
      </footer>
    </div>
  );
};

export default Home;
