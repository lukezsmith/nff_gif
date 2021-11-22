import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useState } from "react";
import { DownloadBtn } from "../components/DownloadBtn";
import { Gif } from "../components/Gif";
import { InputTokenID } from "../components/InputTokenID";
import { InputVideo } from "../components/InputVideo";

const ffmpeg = createFFmpeg({ log: true });

const ipfsURL =
  "https://ipfs.io/ipfs/QmUZxB4PmiwWa524ScscBsXiMhnLHAsB6N9JHtM4jv5Ppu/";

const Home: NextPage = () => {
  const [ready, setReady] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [gif, setGif] = useState("");

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
    // console.log(videoURL)
  }, []);

  const getVideoURL = async (e: string) => {
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
    // Write the .mp4 to the FFmpeg file system
    ffmpeg.FS("writeFile", "video1.mp4", await fetchFile(videoURL));

    // Run the FFmpeg command-line tool, converting
    // the .mp4 into .gif file
    await ffmpeg.run(
      "-i",
      "video1.mp4",
      // "-t",
      // "2",
      // "-ss",
      // "2.0",
      "-f",
      "gif",
      "out.gif"
    );
    // Read the .gif file back from the FFmpeg file system
    const data = ffmpeg.FS("readFile", "out.gif");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setGif(url);
  };

  const download = (e) => {
    console.log(e.target.href);
    fetch(e.target.href, {
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
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return ready ? (
    <div className="bg-white text-center">
      <Head>
        <title>NFF GIF</title>
        <meta name="description" content="NFF GIF" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl bold my-10 ">Non Fungible Fungi Gif Generator</h1>
      <div className="grid grid-cols-2 lg:mx-64 bg-gray-100 rounded-xl lg:p-10">
        <div className="grid-rows-3  lg:px-10 my-10 flex flex-col justify-center">
          <h1 className="text-xl bold">Enter TokenID: </h1>
          <input
            placeholder="Enter your TokenID here..."
            className="bg-gray-300 placeholder-gray-800::placeholder"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                getVideoURL((e.target as HTMLTextAreaElement).value);
              }
            }}
          ></input>
          {videoURL !== "" ? (
            <div className="lg:my-10">
              <video controls crossOrigin="anonymous" src={videoURL} />
            </div>
          ) : (
            ""
          )}
          <div>
            <button
              className="my-5 p-3 bg-gray-300 rounded-md hover:bg-gray-400"
              onClick={convertToGif}
            >
              Convert
            </button>
          </div>
        </div>
        <div className="grid-rows-3 lg:px-10 my-10 flex flex-col justify-center">
          <div>
          <h1 className="text-xl bold">Result</h1>
          </div>
            {gif !== "" ? gif && <div className="lg:my-10"><Gif gif={gif} /></div> : ""}
            {gif !== "" ? <div><DownloadBtn gif={gif} download={download} /> </div>: ""}
        </div>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Home;
