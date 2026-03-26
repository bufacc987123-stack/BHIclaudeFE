"use client";

export default function WidgetIcon({ toggle }: any) {
  return (
    <button className="widget-icon" onClick={toggle}>
      🤖
    </button>
  );
}