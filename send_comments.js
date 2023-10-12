const fetch = require("node-fetch");
const fs = require("fs");

const commentsArray = [
  {
    comment_text: "댓글보내기예시",
    commented_post_id: 1,
  },
];

const baseUrl = "http://localhost:5000/v1/comments";

async function fetchData(commentObj) {
  const url = baseUrl;
  const body = JSON.stringify(commentObj); // commentObj를 직접 body로 전달
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsInVzZXJfZW1haWwiOiJ5c2hpbmI5OEBuYXZlci5jb20iLCJpYXQiOjE2OTcwOTkxMDcsImV4cCI6MTY5NzEwMjcwN30.v1DqCuQhdIfo_3WNIEEHBjdRpFVaAQJu2NZAJvt8wCw",
    },
    body: body,
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Error fetching data for ${commentObj.comment_text}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching data for ${commentObj.comment_text}: ${error.message}`
    );
    return null;
  }
}

async function main() {
  const dataToSave = {};

  for (const commentObj of commentsArray) {
    const data = await fetchData(commentObj);
    if (data) {
      dataToSave[commentObj.comment_text] = data;
      console.log(`Fetched data for ${commentObj.comment_text}`);
    }
  }

  const filename = "send_comments.json";
  fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 4), "utf-8");
  console.log(`All data saved to ${filename}`);
}

main();
