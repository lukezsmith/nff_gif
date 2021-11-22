import type { NextPage } from "next";
import Head from "next/head";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useState } from "react";
import { DownloadBtn } from "../components/DownloadBtn";
import { Gif } from "../components/Gif";
import ClipLoader from "react-spinners/ClipLoader";

const ffmpeg = createFFmpeg({ log: true });

const ipfsURL =
  "https://ipfs.io/ipfs/QmUZxB4PmiwWa524ScscBsXiMhnLHAsB6N9JHtM4jv5Ppu/";

const Home: NextPage = () => {
  const [ready, setReady] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [gif, setGif] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
    // console.log(videoURL)
  }, []);

  const getVideoURL = async (e: string) => {
    let tokenId = parseInt(e);
    if (tokenId < 0 || tokenId > 10000 || isNaN(tokenId)) {
      alert("Invalid id!");
      return;
    }
    fetch(ipfsURL + e + ".json").then(function (response) {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status Code: " + response.status
        );
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
      });
    });
  };

  const convertToGif = async () => {
    setLoading(true);
    // Write the .mp4 to the FFmpeg file system
    ffmpeg.FS("writeFile", "video1.mp4", await fetchFile(videoURL));

    // Run the FFmpeg command-line tool, converting
    // the .mp4 into .gif file
    await ffmpeg.run(
      "-i",
      "video1.mp4",
      "-t",
      "2",
      "-vf",
      "fps=45,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      "out.gif"
    );
    // Read the .gif file back from the FFmpeg file system
    const data = ffmpeg.FS("readFile", "out.gif");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setLoading(false);
    setGif(url);
  };

  const download = (e: React.MouseEvent) => {
    console.log((e.target as HTMLAnchorElement).href);
    fetch((e.target as HTMLAnchorElement).href, {
      method: "GET",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "image.gif");
          document.body.appendChild(link);
          // link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return ready ? (
    <div id="main" className="bg-white text-center flex flex-col items-center">
      <Head>
        <title>NFF GIF</title>
        <meta name="description" content="NFF GIF" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-lg lg:text-4xl bold my-10 ">
        🍄 Non Fungible Fungi GIF Generator 🍄
      </h1>
      <div className="invisible sm:visible grid grid-cols-2 mx-2 lg:mx-64 bg-gray-100 rounded-xl lg:p-10">
        <div className="grid-rows-3 mx-10 lg:mx-20 my-10 lg:my-0 flex flex-col justify-center">
          <div className="">
            <h1 className="text-md lg:text-xl bold">Enter TokenID: </h1>
            <input
              id="token-input"
              placeholder="Enter your TokenID here..."
              className="bg-gray-300 p-1 placeholder-gray-800::placeholder my-5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
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
                <video controls crossOrigin="anonymous" src={videoURL} />
              </div>
              <div className=" my-3 lg:my-0 ">
                <a
                  className="cursor-pointer p-3 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={convertToGif}
                >
                  Convert
                </a>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="grid-rows-3 mx-10 lg:mx-20 my-10 lg:my-0 flex flex-col justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-md lg:text-xl bold">Result: </h1>
            <ClipLoader loading={loading} />
            <input
              placeholder="result"
              className="invisible bg-gray-300 placeholder-gray-800::placeholder my-5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getVideoURL((e.target as HTMLTextAreaElement).value);
                }
              }}
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
            <div className=" my-3 lg:my-0 ">
              <DownloadBtn gif={gif} download={download} />{" "}
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
        <title>NFF GIF</title>
        <meta name="description" content="NFF GIF" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl bold my-10 ">Loading...</h1>
      <footer className="absolute bottom-5 right-5 text-xs text-gray-400">
        <a href="https://twitter.com/lukezsmith" className="underline">
          @lukezsmith
        </a>
      </footer>
    </div>
  );
};

export default Home;
