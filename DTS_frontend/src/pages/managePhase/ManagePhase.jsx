import React, { useEffect } from 'react';

function ManagePhase() {
  useEffect(() => {
    // 確保只在組件掛載後執行
    initTableauViz();
  }, []);

  const initTableauViz = () => {
    const vizUrl = "https://public.tableau.com/views/_17171431116760/1";

    const options = {
      hideTabs: true,
      hideToolbar: true,
      onFirstInteractive: function() {
        console.log("Tableau Viz has finished loading.");
      }
    };

    const vizContainer = document.getElementById('vizContainer');
    if (vizContainer && !vizContainer.viz) { // 避免重複加載
      const viz = new window.tableau.Viz(vizContainer, vizUrl, options);
      vizContainer.viz = viz; // 存儲以防止重複創建
    }
  };

  return (
    <div id="vizContainer" style={{ width: '1000px', height: '800px' }}></div>
  );
}

export default ManagePhase;