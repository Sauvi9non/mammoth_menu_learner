import React, { useState, useMemo } from "react";
import { Search, Snowflake, Flame, CircleHelp, Sparkles, Clock, X, ChevronRight } from "lucide-react";

const MENUS = [{"name": "아메리카노", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["얼음", "물", "에스프레소 샷"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "꿀 커피", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["꿀", "에스프레소 샷", "물", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "카페 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["우유", "에스프레소 샷", "얼음", "우유"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "헤이즐넛 커피", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M", "steps": ["헤이즐넛 파우더", "헤이즐넛 시럽?", "에스프레소 샷", "물", "얼음"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "헤이즐넛 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M", "steps": ["헤이즐넛 파우더", "에스프레소 샷", "우유", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "헤이즐넛 모카", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "바나나 달달 커피", "cat": "커피", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "핫", "size": "S/M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M", "steps": ["바나나 파우더", "연유?", "에스프레소 샷", "물", "얼음"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "베트남 연유 커피", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M", "steps": ["연유", "물", "얼음", "에스프레소 샷", "연유 드리즐링"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "꿀 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["꿀", "에스프레소 샷", "우유", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "바닐라 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["바닐라 시럽", "에스프레소 샷", "우유", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "아몬드 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["아몬드 시럽", "에스프레소 샷", "우유", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "골든 코코넛 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "시그니처 라떼", "cat": "커피", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "카페 모카", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["초코 시럽", "에스프레소 샷", "우유", "얼음", "코코아 가루"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "믹스 커피", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "솔티드 카라멜 마키아토", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["시럽", "카라멜 시럽?", "우유", "얼음", "에스프레소 샷", "카라멜 시럽 드리즐링"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "아샷추 복숭아 아이스티", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M/L", "steps": ["얼음", "아이스티", "에스프레소 샷"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "아인슈페너 커피", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "S", "steps": ["얼음", "물", "아인슈페너 크림?", "코코아 가루?", "에스프레소 샷", "아인슈페너 크림?", "코코아 가루?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "아인슈페너 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "S", "steps": ["얼음", "우유", "아인슈페너 크림?", "코코아 가루?", "에스프레소 샷", "아인슈페너 크림?", "코코아 가루?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "바닐라 크럼블 아이스크림 라떼", "cat": "커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "S", "steps": ["우유", "뭔가 시럽?", "얼음", "아이스크림", "에스프레소 샷", "크럼블", "코코아 가루?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "콜드브루", "cat": "콜드브루", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "콜드브루 라떼", "cat": "콜드브루", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "돌체 콜드브루 라떼", "cat": "콜드브루", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["연유", "우유", "콜드브루", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "달고나 콜드브루 라떼", "cat": "콜드브루", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "레몬 토닉 콜드브루", "cat": "콜드브루", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "매머드 콜드브루 원액", "cat": "콜드브루", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "기타", "size": "기타", "steps": [], "note": null, "uncertain": false}], "temps": ["기타"], "has_recipe": false, "has_uncertain": false}, {"name": "말차 클래식 라떼", "cat": "논커피", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "딸기 라떼", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["시럽", "우유", "얼음", "딸기청"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "고구마 라떼", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["고구마 베이스?", "우유", "얼음"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "토피넛 라떼", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["우유", "토피넛 파우더", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "초코 라떼", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "S/M/L", "steps": ["우유", "초코 파우더", "얼음", "코코아 가루?"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "곡물 라떼", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": ["시럽", "곡물 파우더", "두유", "얼음"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "로얄 밀크티", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M/L", "steps": ["시럽?", "밀크티 베이스", "우유", "얼음"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "아몬드 밀크티", "cat": "논커피", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "핫", "size": "M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M/L", "steps": ["밀크티 베이스", "아몬드 시럽?", "우유", "얼음", "아몬드 토핑"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "달고나 라떼", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M/L", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M/L", "steps": ["달고나", "시럽", "우유", "얼음", "달고나 토핑"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "스팀 밀크", "cat": "논커피", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "HOT ONLY", "size": "S/M/L", "steps": [], "note": null, "uncertain": false}], "temps": ["HOT ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "쌍화차", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "나주 배숙차", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "애플 모과차", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "매머드 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "L", "steps": ["자몽 슬라이스", "레몬 슬라이스", "오렌지 슬라이스", "자몽청?", "시럽?", "얼음", "사이다?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "복숭아 아이스티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M/L", "steps": ["얼음", "아이스티"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "인크레드불", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["무슨 시럽?", "어떤 시럽?", "얼음", "레드불"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "유자 티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M/L", "steps": [], "note": null, "uncertain": false}], "temps": ["핫"], "has_recipe": false, "has_uncertain": false}, {"name": "유자 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "아이스", "size": "M/L", "steps": ["유자청", "얼음", "사이다"], "note": null, "uncertain": false}], "temps": ["아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "레몬밤 민트티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": ["레몬밤 시럽?", "민트 시럽?", "얼음", "물"], "note": null, "uncertain": true}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "청포도 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["청포도 시럽", "얼음", "사이다"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "장수 오미자 티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M/L", "steps": [], "note": null, "uncertain": false}], "temps": ["핫"], "has_recipe": false, "has_uncertain": false}, {"name": "장수 오미자 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "아이스", "size": "M/L", "steps": ["오미자 시럽", "얼음", "사이다?"], "note": null, "uncertain": true}], "temps": ["아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "깔라만시 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M/L", "steps": ["깔라만시 시럽", "얼음", "사이다"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "한라봉 티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫"], "has_recipe": false, "has_uncertain": false}, {"name": "한라봉 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "아이스", "size": "M", "steps": ["한라봉청", "얼음", "사이다?"], "note": null, "uncertain": true}], "temps": ["아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "청귤 티", "cat": "티/에이드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫"], "has_recipe": false, "has_uncertain": false}, {"name": "청귤 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "아이스", "size": "M", "steps": ["청귤청", "시럽?", "얼음", "사이다", "청귤칩"], "note": null, "uncertain": true}], "temps": ["아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "자몽 티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫"], "has_recipe": false, "has_uncertain": false}, {"name": "자몽 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "아이스", "size": "M", "steps": ["자몽청", "얼음", "사이다?", "자몽 슬라이스"], "note": null, "uncertain": true}], "temps": ["아이스"], "has_recipe": true, "has_uncertain": true}, {"name": "블루레몬 티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫"], "has_recipe": false, "has_uncertain": false}, {"name": "블루레몬 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "히비스커스 유자티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": ["뜨거운 물", "티백", "얼음", "유자청"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "지리산 청매실티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": ["매실 원액", "얼음", "물"], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "자몽 허니 블랙티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "오렌지 루이보스티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "애플 히비스커스티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "머스캣 그린티", "cat": "티/에이드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "수박 주스", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "파인애플 주스", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "제로 복숭아 아이스티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M/L", "steps": ["무슨 시럽이야 이거", "얼음", "물"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "제로 체리콕 에이드", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M/L", "steps": ["체리 베이스?", "얼음", "제로 콜라"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "페퍼민트티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "캐모마일티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "얼그레이티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": ["뜨거운 물", "티백", "얼음"], "note": "티백은 2분 간 우린다.", "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": true, "has_uncertain": false}, {"name": "레몬&오렌지(홍차)티", "cat": "티/에이드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "핫", "size": "M", "steps": [], "note": null, "uncertain": false}, {"temp": "아이스", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["핫", "아이스"], "has_recipe": false, "has_uncertain": false}, {"name": "말차 클래식 프라페", "cat": "프라페/블렌디드", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "딸기 쿠키 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "곡물 쉐이크", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "딸기 요거트 스무디", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "플레인 요거트 스무디", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "요거트 파우더", "얼음"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "블루베리 요거트 스무디", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "밀크쉐이크", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "밀크쉐이크 파우더", "뭔가 시럽?", "얼음"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "딸기 밀크쉐이크", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "밀크쉐이크 파우더", "뭔가 시럽?", "얼음", "딸기청?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "솔티드 카라멜 밀크쉐이크", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "밀크쉐이크 파우더", "뭔가 시럽?", "얼음", "카라멜 시럽?", "카라멜 시럽 드리즐링"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "피넛버터 밀크쉐이크", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "밀크쉐이크 파우더", "뭔가 시럽?", "피넛 버터", "얼음", "무언가?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "초코 밀크쉐이크", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "밀크쉐이크 파우더", "뭔가 시럽?", "초코 시럽", "얼음", "다크 컬", "초코시럽", "다크컬 토핑"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "리얼 망고 스무디", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["물", "망고", "얼음"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "리얼 배 스무디", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["물", "배", "얼음"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "리얼 복숭아 스무디", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["물", "복숭아", "얼음"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "바나나 초코칩 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "바나나 파우더", "연유?", "얼음", "다크블로썸?", "휘핑크림"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "자바칩 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "자바 파우더?", "초코 시럽?", "초코 청크", "얼음", "초코시럽?", "휘핑크림", "자바칩"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "피스타치오 아몬드 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "얼음", "피스타치오 파우더", "휘핑크림", "아몬드 토핑"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "민트 초코 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "민트 초코 파우더", "얼음", "다크 컬?", "휘핑크림", "초코칩"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "오레오 초코 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "오레오 파우더", "오레오", "얼음", "휘핑크림", "오레오 토핑"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "초코 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "초코 파우더", "뭔 파우더?", "얼음", "휘핑크림", "초코 시럽 드리즐링", "초코칩?"], "note": null, "uncertain": true}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": true}, {"name": "콜드브루 커피 프라페", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": ["우유", "콜드브루", "커피 파우더", "얼음", "시럽"], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": true, "has_uncertain": false}, {"name": "포도 사과 젤리 크러쉬", "cat": "프라페/블렌디드", "is_new": false, "is_discontinuing": true, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "말차 제주 레몬 크러쉬", "cat": "프라페/블렌디드", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "말차 딸기 라떼", "cat": "논커피", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "말차 클라우드 블루 코코넛 라떼", "cat": "논커피", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}, {"name": "말차 클라우드 블루 코코넛 워터", "cat": "티/에이드", "is_new": true, "is_discontinuing": false, "variants": [{"temp": "ICE ONLY", "size": "M", "steps": [], "note": null, "uncertain": false}], "temps": ["ICE ONLY"], "has_recipe": false, "has_uncertain": false}];

const CATS = ["전체", "커피", "콜드브루", "논커피", "티/에이드", "프라페/블렌디드"];

const CAT_COLOR = {
  "커피": "#8A5A2B", "콜드브루": "#5A4632", "논커피": "#3F7D5C",
  "티/에이드": "#C06A3E", "프라페/블렌디드": "#7A5BA6",
};

const C = {
  bg: "#F7F3EC", card: "#FFFFFF", ink: "#2A2017", sub: "#8A7B68",
  line: "#E7DECF", brand: "#7A1F1A", brandSoft: "#F0E2DA",
  hot: "#C0461F", ice: "#2F7DB0", iceBg: "#E5F0F7", hotBg: "#F8E7E0",
  newC: "#1D7A52", newBg: "#E2F2EA", disc: "#9A8348", discBg: "#F3ECD8",
  warn: "#B5852A", warnBg: "#FBF1DB",
};

const badge = { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 999, lineHeight: 1.5, whiteSpace: "nowrap" };

function tempLabel(t) {
  if (t === "핫") return "핫";
  if (t === "아이스") return "아이스";
  if (t === "HOT ONLY") return "핫 전용";
  if (t === "ICE ONLY") return "아이스 전용";
  return t;
}
function tempStyle(t) {
  if (t === "핫" || t === "HOT ONLY") return { color: C.hot, background: C.hotBg };
  if (t === "아이스" || t === "ICE ONLY") return { color: C.ice, background: C.iceBg };
  return { color: C.sub, background: "#EEE8DD" };
}
function isUncertainStep(s) {
  return s.includes("?") || s.includes("뭔") || s.includes("무슨") || s.includes("무언가") || s.includes("어떤");
}

function MenuCard({ m, onClick }) {
  const accent = CAT_COLOR[m.cat] || C.sub;
  return (
    <button onClick={() => onClick(m)} style={{
      textAlign: "left", background: C.card, border: `1px solid ${C.line}`,
      borderRadius: 14, padding: 0, cursor: "pointer", width: "100%", overflow: "hidden",
      display: "flex", flexDirection: "column", transition: "transform .12s, box-shadow .12s",
      opacity: m.is_discontinuing ? 0.72 : 1,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(80,50,20,.09)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ height: 64, background: accent, opacity: 0.13, display: "flex", alignItems: "center", justifyContent: "center" }} />
      <div style={{ padding: "11px 14px 13px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>{m.name}</span>
          <ChevronRight size={16} style={{ color: C.sub, flexShrink: 0, marginTop: 2 }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {m.temps.map((t, i) => <span key={i} style={{ ...badge, ...tempStyle(t) }}>{t.includes("핫") || t === "HOT ONLY" ? <Flame size={10} /> : <Snowflake size={10} />}{tempLabel(t)}</span>)}
          {m.is_new && <span style={{ ...badge, color: C.newC, background: C.newBg }}><Sparkles size={10} /> 신메뉴</span>}
          {m.is_discontinuing && <span style={{ ...badge, color: C.disc, background: C.discBg }}><Clock size={10} /> 단종</span>}
        </div>
        <span style={{ fontSize: 11.5, color: m.has_recipe ? (m.has_uncertain ? C.warn : C.sub) : "#B6A78F" }}>
          {m.has_recipe ? (m.has_uncertain ? "레시피 있음 · 확인필요" : "레시피 있음") : "레시피 미입력"}
        </span>
      </div>
    </button>
  );
}

function DetailModal({ m, onClose }) {
  const [vIdx, setVIdx] = useState(0);
  React.useEffect(() => { setVIdx(0); }, [m]);
  if (!m) return null;
  const v = m.variants[vIdx];
  const sizes = (v.size || "").split("/").filter(Boolean);

  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(40,28,18,.42)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 18, padding: 24, maxWidth: 400, width: "100%",
        maxHeight: "86%", overflowY: "auto", boxShadow: "0 18px 50px rgba(40,25,10,.28)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: C.ink }}>{m.name}</div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>{m.cat}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
          {m.is_new && <span style={{ ...badge, color: C.newC, background: C.newBg }}><Sparkles size={10} /> 신메뉴</span>}
          {m.is_discontinuing && <span style={{ ...badge, color: C.disc, background: C.discBg }}><Clock size={10} /> 단종예정</span>}
        </div>

        {m.variants.length > 1 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 7 }}>온도 선택</div>
            <div style={{ display: "flex", gap: 7 }}>
              {m.variants.map((vv, i) => {
                const active = i === vIdx;
                const st = tempStyle(vv.temp);
                return (
                  <button key={i} onClick={() => setVIdx(i)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                    border: `1.5px solid ${active ? st.color : C.line}`,
                    background: active ? st.background : C.card, color: active ? st.color : C.sub,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}>{vv.temp.includes("핫") || vv.temp === "HOT ONLY" ? <Flame size={13} /> : <Snowflake size={13} />}{tempLabel(vv.temp)}</button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 7 }}>사이즈</div>
          <div style={{ display: "flex", gap: 6 }}>
            {sizes.length ? sizes.map((s, i) => (
              <span key={i} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 600, color: C.ink, background: C.bg }}>{s}</span>
            )) : <span style={{ fontSize: 13, color: C.sub }}>-</span>}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, marginBottom: 10 }}>제조 순서 {m.variants.length > 1 ? `(${tempLabel(v.temp)})` : ""}</div>
          {v.steps.length > 0 ? (
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
              {v.steps.map((s, i) => {
                const unc = isUncertainStep(s);
                return (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: C.brandSoft, color: C.brand, fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    <span style={{ fontSize: 14.5, color: unc ? C.warn : C.ink, fontWeight: unc ? 600 : 500 }}>{s}{unc && <CircleHelp size={12} style={{ marginLeft: 4, verticalAlign: -1 }} />}</span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div style={{ fontSize: 13.5, color: "#B6A78F", padding: "14px 0" }}>아직 레시피가 입력되지 않았어요.<br />교육 때 확인하고 채워주세요.</div>
          )}
        </div>

        {v.note && <div style={{ marginTop: 16, padding: "10px 12px", background: C.warnBg, borderRadius: 10, fontSize: 12.5, color: "#7A5C18" }}>💡 {v.note}</div>}
        {v.uncertain && <div style={{ marginTop: 12, fontSize: 11.5, color: C.warn, display: "flex", alignItems: "center", gap: 5 }}><CircleHelp size={13} /> 물음표 항목은 교육 때 꼭 확인하세요</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);

  const filtered = useMemo(() => {
    return MENUS.filter(m => {
      if (cat !== "전체" && m.cat !== cat) return false;
      if (q.trim()) {
        const t = q.trim().toLowerCase();
        return m.name.toLowerCase().includes(t) || m.variants.some(v => v.steps.some(s => s.toLowerCase().includes(t)));
      }
      return true;
    });
  }, [cat, q]);

  const stats = useMemo(() => {
    const total = MENUS.length;
    const withR = MENUS.filter(m => m.has_recipe).length;
    return { total, withR, pct: Math.round(withR / total * 100) };
  }, []);

  return (
    <div style={{ position: "relative", fontFamily: "'Pretendard', -apple-system, sans-serif", background: C.bg, minHeight: 600, color: C.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 18px 40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, margin: 0, color: C.brand, letterSpacing: -.5 }}>매머드 메뉴 학습</h1>
          <span style={{ fontSize: 12.5, color: C.sub }}>익스프레스 · {stats.total}종</span>
        </div>
        <p style={{ fontSize: 12.5, color: C.sub, margin: "6px 0 0" }}>
          레시피 입력 {stats.withR}/{stats.total} ({stats.pct}%) · 나머지는 교육 때 채우기
        </p>

        <div style={{ position: "relative", marginTop: 18 }}>
          <Search size={17} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.sub }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="메뉴명·재료 검색 (예: 우유, 시럽, 라떼)"
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 38px", fontSize: 14, borderRadius: 12, border: `1px solid ${C.line}`, background: C.card, color: C.ink, outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14 }}>
          {CATS.map(c => {
            const active = c === cat;
            const n = c === "전체" ? MENUS.length : MENUS.filter(m => m.cat === c).length;
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "7px 13px", fontSize: 12.5, fontWeight: 600, borderRadius: 999, cursor: "pointer",
                border: `1px solid ${active ? C.brand : C.line}`, background: active ? C.brand : C.card,
                color: active ? "#fff" : C.sub, transition: "all .12s",
              }}>{c} <span style={{ opacity: .7, fontSize: 11 }}>{n}</span></button>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: C.sub, margin: "16px 2px 10px" }}>{filtered.length}개 메뉴</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 11 }}>
          {filtered.map((m, i) => <MenuCard key={i} m={m} onClick={setSel} />)}
        </div>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: C.sub, padding: "50px 0", fontSize: 14 }}>검색 결과가 없어요</div>}
      </div>
      <DetailModal m={sel} onClose={() => setSel(null)} />
    </div>
  );
}
