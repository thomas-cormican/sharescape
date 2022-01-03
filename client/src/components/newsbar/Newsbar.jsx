import React, { useState, useEffect } from "react";
import axios from "axios";

import "./newsbar.scss";

function Newsbar() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function getNews() {
      let response = await axios.get("/api/external/news");
      setNews(response.data.stories);
    }
    getNews();
  }, []);

  return (
    <div className="newsbar">
      <h3>News</h3>
      <a href={news[0]?.url}>
        <div className="newsbar__block">
          <div className="newsbar__content">
            <p className="newsbar__title">{news[0]?.title}</p>
          </div>
          <div className="newsbar__image">
            <img src={news[0]?.urlToImage} alt="" />
          </div>
        </div>
      </a>
      <a href={news[1]?.url}>
        <div className="newsbar__block">
          <div className="newsbar__content">
            <p className="newsbar__title">{news[1]?.title}</p>
          </div>
          <div className="newsbar__image">
            <img src={news[1]?.urlToImage} alt="" />
          </div>
        </div>
      </a>
      <a href={news[2]?.url}>
        <div className="newsbar__block">
          <div className="newsbar__content">
            <p className="newsbar__title">{news[2]?.title}</p>
          </div>
          <div className="newsbar__image">
            <img src={news[2]?.urlToImage} alt="" />
          </div>
        </div>
      </a>
      <a href={news[3]?.url}>
        <div className="newsbar__block">
          <div className="newsbar__content">
            <p className="newsbar__title">{news[3]?.title}</p>
          </div>
          <div className="newsbar__image">
            <img src={news[3]?.urlToImage} alt="" />
          </div>
        </div>
      </a>
    </div>
  );
}

export default Newsbar;
