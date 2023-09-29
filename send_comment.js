const fetch = require("node-fetch");
const fs = require("fs");

const placesArray = [
  {
    place_name: "코엑스",
    post_star_rating: 5.0,
    post_description: "코엑스",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/1코엑스.jpeg",
    place_latitude: 127.0588278439012,
    place_longitude: 37.51266138067201,
  },
];

const baseUrl = "http://localhost:5000/v1/comments";

async function fetchData(placeObj) {
  const url = baseUrl;
  const body = JSON.stringify({
    place_name: placeObj.place_name,
    post_star_rating: placeObj.post_star_rating,
    post_description: placeObj.post_description,
    post_image_url: placeObj.post_image_url,
    place_latitude: placeObj.place_latitude,
    place_longitude: placeObj.place_longitude,
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_ACCESS_TOKEN",
    },
    body: body,
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Error fetching data for ${placeObj.place_name}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching data for ${placeObj.place_name}: ${error.message}`
    );
    return null;
  }
}

async function main() {
  const dataToSave = {};

  for (const placeObj of placesArray) {
    const data = await fetchData(placeObj);
    if (data) {
      dataToSave[placeObj.place_name] = data;
      console.log(`Fetched data for ${placeObj.place_name}`);
    }
  }

  const filename = "landmarks_posts.json";
  fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 4), "utf-8");
  console.log(`All data saved to ${filename}`);
}

main();
