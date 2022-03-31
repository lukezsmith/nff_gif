// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
// var ffmpeg = require("ffmpeg");
// import fetch from 'node-fetch';

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
  // let gifConfig =
  //   "fps=45,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse";
  // try {
  //   var process = new ffmpeg(
  //     "https://ipfs.io/ipfs/QmQBKc7LQGFiYynGsiYNBboUHVoZTaS7gb7stN1dzEJhV3/8049.mp4"
  //   );
  //   process.then(function (video: any) {
  //     video.setVideoDuration(2.2);
  //     video.addCommand("-vf", gifConfig);
  //     video.save("out.gif");
  //     console.log(video);
  //     res.status(200).json({ name: "success" });
  //   }, function (err: any) {
  //     console.log(err);
  //     res.status(500).json({ name: err });
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json({ name: error });
  // }
}
