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
  {
    place_name: "일자산허브천문공원",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/2허브천문공원.jpeg",
    place_latitude: 127.153348908729,
    place_longitude: 37.537308977014,
  },
  {
    place_name: "국립4.19민주묘지",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/3국립419민주묘지.jpeg",
    place_latitude: 127.007655529176,
    place_longitude: 37.648576279141,
  },
  {
    place_name: "서울식물원",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/4서울식물원.jpeg",
    place_latitude: 126.835037244018,
    place_longitude: 37.5693958477101,
  },
  {
    place_name: "서울대학교 관악캠퍼스",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/5서울대학교.jpeg",
    place_latitude: 126.9511239870991,
    place_longitude: 37.45978574975834,
  },
  {
    place_name: "어린이대공원",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/6어린이대공원.png",
    place_latitude: 127.0837890946919,
    place_longitude: 37.55147044344215,
  },
  {
    place_name: "신도림테크노마트",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/7신도림테크노마트.jpeg",
    place_latitude: 126.890265628638,
    place_longitude: 37.5070478415241,
  },
  {
    place_name: "금천체육공원",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/8금천체육공원.jpeg",
    place_latitude: 126.908494973796,
    place_longitude: 37.4682335409953,
  },
  {
    place_name: "경춘선숲길",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/9경춘선숲길.jpeg",
    place_latitude: 127.078706040469,
    place_longitude: 37.620691807133,
  },
  {
    place_name: "도봉산",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/10도봉산.jpeg",
    place_latitude: 127.0154585932179,
    place_longitude: 37.69884206393718,
  },
  {
    place_name: "세종대왕기념관",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/11세종대왕기념관.jpeg",
    place_latitude: 127.043587838139,
    place_longitude: 37.5908403884541,
  },
  {
    place_name: "노량진 수산시장",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/12노량진수상시장.jpeg",
    place_latitude: 126.9380033398802,
    place_longitude: 37.51480414922673,
  },
  {
    place_name: "월드컵공원",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/13월드컵공원.jpeg",
    place_latitude: 126.959542648447,
    place_longitude: 37.5724504220421,
  },
  {
    place_name: "독립문",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/14독립문.jpeg",
    place_latitude: 126.959542648447,
    place_longitude: 37.5724504220421,
  },
  {
    place_name: "예술의전당",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/%E1%84%85%E1%85%A2%E1%86%AB%E1%84%83%E1%85%B3%E1%84%86%E1%85%A1%E1%84%8F%E1%85%B3/15%E1%84%8B%E1%85%A8%E1%84%89%E1%85%AE%E1%86%AF%E1%84%8B%E1%85%B4%E1%84%8C%E1%85%A5%E1%86%AB%E1%84%83%E1%85%A1%E1%86%BC.webp",
    place_latitude: 127.0117919806623,
    place_longitude: 37.47922106107729,
  },
  {
    place_name: "서울숲",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/16서울숲공원.jpeg",
    place_latitude: 127.037617759165,
    place_longitude: 37.5443222301513,
  },
  {
    place_name: "정릉",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/17정릉.webp",
    place_latitude: 127.1025555865833,
    place_longitude: 37.51260447840551,
  },
  {
    place_name: "롯데월드타워",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/18롯데월드타워.webp",
    place_latitude: 127.1025555865833,
    place_longitude: 37.51260447840551,
  },
  {
    place_name: "목동아이스링크",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/19목동아이스링크.jpeg",
    place_latitude: 126.879261276407,
    place_longitude: 37.5307334776835,
  },
  {
    place_name: "63스퀘어",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/20육삼빌딩.webp",
    place_latitude: 126.940261584441,
    place_longitude: 37.5198148915709,
  },
  {
    place_name: "남산타워",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/21남산서울타워.webp",
    place_latitude: 126.988230622132,
    place_longitude: 37.5513049702718,
  },
  {
    place_name: "진관사",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/22진관사.jpeg",
    place_latitude: 126.946885657783,
    place_longitude: 37.63803747255906,
  },
  {
    place_name: "광화문",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/23광화문.jpeg",
    place_latitude: 126.976861018866,
    place_longitude: 37.5759689663327,
  },
  {
    place_name: "숭례문",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/24숭례문.jpeg",
    place_latitude: 126.975313124237,
    place_longitude: 37.5600030088843,
  },
  {
    place_name: "용마폭포공원",
    post_star_rating: 5.0,
    post_description: "랜드마크",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/25용마폭포공원.jpeg",
    place_latitude: 127.090053515636,
    place_longitude: 37.5736051123377,
  },
  // {
  //   place_name: "달리는커피 거제상동점",
  //   post_star_rating: 5.0,
  //   post_description: "달려라 왕바우",
  //   post_image_url:
  //     "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/25용마폭포공원.jpeg",
  //   place_latitude: 128.635266779107,
  //   place_longitude: 34.8610605916813,
  // },
];

const baseUrl = "http://localhost:5000/v1/posts";
// const baseUrl = "https://api.yubinhome.com/v1/posts";
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
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJfZW1haWwiOiJzaGluLnl1YmluMThAZ21haWwuY29tIiwiaWF0IjoxNjk1OTk0MjM0LCJleHAiOjE2OTU5OTc4MzR9.l3i_x_jdzeTnyxlmef-XUXat-B_IYiBRXrf1y1nj0Es",
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

  const filename = "send_posts.json";
  fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 4), "utf-8");
  console.log(`All data saved to ${filename}`);
}

main();
