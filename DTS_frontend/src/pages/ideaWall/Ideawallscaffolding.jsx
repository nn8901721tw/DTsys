import React from 'react'

export default function Ideawall_scaffolding() {
  return (
    <div className="w-64 p-4 bg-white rounded-lg shadow-md divide-y divide-gray-200">
    <div className="pb-4">
      <h2 className="text-lg font-semibold text-gray-900">請前往您-專題內展開</h2>
      <p className="mt-1 text-sm text-gray-600">請點擊左側導航欄，並依照步驟開始製作。</p>
    </div>
    <div className="pt-4">
      <ul className="space-y-2 text-sm">
        <li className="flex items-center">
          <span className="flex-shrink-0 w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>
          <span>問題定義與問題聚焦</span>
        </li>
        <li className="flex items-center">
          <span className="flex-shrink-0 w-3 h-3 mr-2 bg-green-500 rounded-full"></span>
          <span>定義創新價值人</span>
        </li>
        <li className="flex items-center">
          <span className="flex-shrink-0 w-3 h-3 mr-2 bg-yellow-500 rounded-full"></span>
          <span>進場域前的同理</span>
        </li>
        <li className="flex items-center">
          <span className="flex-shrink-0 w-3 h-3 mr-2 bg-red-500 rounded-full"></span>
          <span>歸類需求與問題聚焦</span>
        </li>
      </ul>
    </div>
  </div>
  )
}
