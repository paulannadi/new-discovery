import svgPaths from "./svg-sashiffxzq";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[24px] w-full">
        <p className="leading-[32px] whitespace-pre-wrap text-[20px]">Policies</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-[222px]" data-name="Container">
      <Heading />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Check-in</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[24px] relative shrink-0 text-[#191e3b] text-[16px] w-full whitespace-pre-wrap">
        <p className="mb-0">Check-in start time: 3:00 PM; Check-in end time:</p>
        <p>anytime</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Minimum check-in age: 18</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-[312.66px]" data-name="Container">
      <Heading1 />
      <Container4 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Check-out</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Check-out before noon</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-full items-start relative shrink-0 w-[312.67px]" data-name="Container">
      <Heading2 />
      <Container8 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center self-stretch">
        <Container3 />
      </div>
      <div className="flex flex-row items-center self-stretch">
        <Container7 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Special check-in instructions</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Front desk staff will greet guests on arrival at the property</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Information provided by the property may be translated using automated translation tools</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Container10 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Access methods</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Staffed front desk</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading4 />
      <Container14 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Pets</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Pets not allowed (service animals are welcome, and are exempt from fees)</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading5 />
      <Container16 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Children and extra beds</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Children are welcome</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Rollaway/extra beds are not available</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Cribs (infant beds) are not available</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Heading6 />
      <Container18 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-bold justify-center leading-[0] relative shrink-0 text-[#191e3b] text-[18px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">Property payment types</p>
      </div>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_428" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_428)">
            <path d={svgPaths.p21407380} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup1() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_443" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_443)">
            <path d={svgPaths.p1565d780} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup2() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_355" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_355)">
            <path d={svgPaths.p298eff80} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup3() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_433" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_433)">
            <path d={svgPaths.p395e5c00} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup4() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_438" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_438)">
            <path d={svgPaths.p17c76080} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup5() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_339" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d="M0 0H64.6448V63.9731H0V0Z" fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_339)">
            <path d={svgPaths.p3d7a0c00} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup6() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_367" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_367)">
            <path d={svgPaths.p267adef0} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup7() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_423" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_423)">
            <path d={svgPaths.p34c98c0} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup8() {
  return (
    <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Clip path group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
        <g id="Clip path group">
          <mask height="64" id="mask0_74_350" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="65" x="0" y="0">
            <g id="e">
              <path d={svgPaths.p1e35f000} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </mask>
          <g mask="url(#mask0_74_350)">
            <path d={svgPaths.p39aefb00} fill="var(--fill-0, white)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1" data-name="Group">
      <ClipPathGroup />
      <ClipPathGroup1 />
      <ClipPathGroup2 />
      <ClipPathGroup3 />
      <ClipPathGroup4 />
      <ClipPathGroup5 />
      <ClipPathGroup6 />
      <ClipPathGroup7 />
      <ClipPathGroup8 />
    </div>
  );
}

function Group1() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1" data-name="Group">
      <div className="col-1 h-[63.973px] ml-[0.03px] mt-[0.03px] relative row-1 w-[64.564px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.5642 63.9731">
          <path d={svgPaths.p173a5700} fill="url(#paint0_radial_74_448)" id="Vector" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(32.2836 31.9866) scale(32.1449 32.1449)" gradientUnits="userSpaceOnUse" id="paint0_radial_74_448" r="1">
              <stop stopColor="#1AB9EC" />
              <stop offset="0.19" stopColor="#1AB9EC" />
              <stop offset="0.3139" stopColor="#1DADDD" />
              <stop offset="0.5481" stopColor="#1B93C0" />
              <stop offset="0.865" stopColor="#156F99" />
              <stop offset="1" stopColor="#0F618B" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="col-1 h-[63.973px] ml-0 mt-0 relative row-1 w-[64.645px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6448 63.9731">
          <path d={svgPaths.p1fd5e7f0} fill="url(#paint0_radial_74_421)" id="Vector" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(15.6572 11.673) scale(65.0144 65.0144)" gradientUnits="userSpaceOnUse" id="paint0_radial_74_421" r="1">
              <stop stopColor="#26B8EB" />
              <stop offset="0.19" stopColor="#26B8EB" />
              <stop offset="0.3162" stopColor="#27ACDC" />
              <stop offset="0.5545" stopColor="#2192BE" />
              <stop offset="0.8773" stopColor="#166E98" />
              <stop offset="1" stopColor="#0F618B" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <Group2 />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group1 />
    </div>
  );
}

function CardsCcDinersClubSvg() {
  return (
    <div className="h-[64px] relative shrink-0 w-[101.333px]" data-name="cards-cc_diners_club.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 101.333 64">
        <g clipPath="url(#clip0_74_380)" id="cards-cc_diners_club.svg">
          <path d={svgPaths.p2ae0d140} fill="var(--fill-0, #0069AA)" id="Vector" />
          <path d={svgPaths.p21882780} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p21532e00} fill="var(--fill-0, #333743)" id="Vector_3" />
          <path d={svgPaths.p5a1cb00} fill="var(--fill-0, #333743)" id="Vector_4" />
          <path d={svgPaths.p1282ba00} fill="var(--fill-0, #333743)" id="Vector_5" />
          <path d={svgPaths.p20d00e00} fill="var(--fill-0, #333743)" id="Vector_6" />
          <path d={svgPaths.p18d19b80} fill="var(--fill-0, #333743)" id="Vector_7" />
          <path d={svgPaths.p23fa1d00} fill="var(--fill-0, #333743)" id="Vector_8" />
          <path d={svgPaths.pbdace80} fill="var(--fill-0, #333743)" id="Vector_9" />
          <path d={svgPaths.p7be1f00} fill="var(--fill-0, #333743)" id="Vector_10" />
          <path d={svgPaths.p39960280} fill="var(--fill-0, #333743)" id="Vector_11" />
          <path d={svgPaths.p10ec0700} fill="var(--fill-0, #333743)" id="Vector_12" />
          <path d={svgPaths.p36046500} fill="var(--fill-0, #333743)" id="Vector_13" />
          <path d={svgPaths.p4f6a300} fill="var(--fill-0, #333743)" id="Vector_14" />
          <path d={svgPaths.p19a1ab40} fill="var(--fill-0, #333743)" id="Vector_15" />
          <path d={svgPaths.p262da00} fill="var(--fill-0, #333743)" id="Vector_16" />
          <path d={svgPaths.p30a08b00} fill="var(--fill-0, #333743)" id="Vector_17" />
          <path d={svgPaths.p3b72580} fill="var(--fill-0, #333743)" id="Vector_18" />
          <path d={svgPaths.pc98cd00} fill="var(--fill-0, #333743)" id="Vector_19" />
          <path d={svgPaths.p1d859e00} fill="var(--fill-0, #333743)" id="Vector_20" />
          <path d={svgPaths.p29a87300} fill="var(--fill-0, #333743)" id="Vector_21" />
          <path d={svgPaths.p3ea5b900} fill="var(--fill-0, #333743)" id="Vector_22" />
          <path d={svgPaths.p168552c0} fill="var(--fill-0, #333743)" id="Vector_23" />
          <path d={svgPaths.p27ddd180} fill="var(--fill-0, #333743)" id="Vector_24" />
          <path d={svgPaths.p36d04500} fill="var(--fill-0, #333743)" id="Vector_25" />
          <path d={svgPaths.p3e0b5600} fill="var(--fill-0, #333743)" id="Vector_26" />
          <path d={svgPaths.p2fa77640} fill="var(--fill-0, #333743)" id="Vector_27" />
          <path d={svgPaths.p315f2a80} fill="var(--fill-0, #333743)" id="Vector_28" />
          <path d={svgPaths.p3e5706a0} fill="var(--fill-0, #333743)" id="Vector_29" />
          <path d={svgPaths.p1e58bec0} fill="var(--fill-0, #333743)" id="Vector_30" />
          <path d={svgPaths.p2ef68100} fill="var(--fill-0, #333743)" id="Vector_31" />
          <path d={svgPaths.p26957400} fill="var(--fill-0, #333743)" id="Vector_32" />
          <path d={svgPaths.p1882b900} fill="var(--fill-0, #333743)" id="Vector_33" />
          <path d={svgPaths.pf677e00} fill="var(--fill-0, #333743)" id="Vector_34" />
          <path d={svgPaths.p2b3db480} fill="var(--fill-0, #333743)" id="Vector_35" />
          <path d={svgPaths.p36c0c00} fill="var(--fill-0, #333743)" id="Vector_36" />
          <path d={svgPaths.p121bb300} fill="var(--fill-0, #333743)" id="Vector_37" />
          <path d={svgPaths.p342d5300} fill="var(--fill-0, #333743)" id="Vector_38" />
          <path d={svgPaths.p3fba0dc0} fill="var(--fill-0, #333743)" id="Vector_39" />
        </g>
        <defs>
          <clipPath id="clip0_74_380">
            <rect fill="white" height="64" width="101.333" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CardsCcJcbSvg() {
  return (
    <div className="h-[64px] relative shrink-0 w-[101.333px]" data-name="cards-cc_jcb.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 101.333 64">
        <g clipPath="url(#clip0_74_375)" id="cards-cc_jcb.svg">
          <path d={svgPaths.p271cf000} fill="url(#paint0_linear_74_375)" id="Vector" />
          <path d={svgPaths.p39b4d700} fill="url(#paint1_linear_74_375)" id="Vector_2" />
          <path d={svgPaths.p13767c00} fill="url(#paint2_linear_74_375)" id="Vector_3" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_74_375" x1="67.021" x2="93.3319" y1="32.0038" y2="32.0038">
            <stop stopColor="#007B40" />
            <stop offset="1" stopColor="#55B330" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_74_375" x1="8.00288" x2="34.3118" y1="32.0038" y2="32.0038">
            <stop stopColor="#1D2970" />
            <stop offset="1" stopColor="#006DBA" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_74_375" x1="37.5123" x2="63.822" y1="32.0038" y2="32.0038">
            <stop stopColor="#6E2B2F" />
            <stop offset="1" stopColor="#E30138" />
          </linearGradient>
          <clipPath id="clip0_74_375">
            <rect fill="white" height="64" width="101.333" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[0_0.05%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 101.233 64">
        <g id="Group">
          <path d="M101.233 0H0V64H101.233V0Z" fill="var(--fill-0, #333743)" id="XMLID_21_" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[0_0.05%]" data-name="Group">
      <Group4 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute inset-[6.95%_15.42%_8.08%_15.42%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70.0752 54.3759">
        <g id="Group">
          <path d={svgPaths.p68a6000} fill="var(--fill-0, white)" id="XMLID_567_" />
          <g id="XMLID_328_">
            <path d={svgPaths.pfcd5e00} fill="var(--fill-0, #FF5F00)" id="Vector" />
            <path d={svgPaths.p393a8c00} fill="var(--fill-0, #EB001B)" id="XMLID_330_" />
            <path d={svgPaths.p34453070} fill="var(--fill-0, #F79E1B)" id="Vector_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function CardsCcMasterCardSvg() {
  return (
    <div className="h-[64px] overflow-clip relative shrink-0 w-[101.333px]" data-name="cards-cc_master_card.svg">
      <Group3 />
      <Group5 />
    </div>
  );
}

function CardsCcVisaSvg() {
  return (
    <div className="h-[64px] relative shrink-0 w-[115.123px]" data-name="cards-cc_visa.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 115.123 64">
        <g clipPath="url(#clip0_74_344)" id="cards-cc_visa.svg">
          <path d={svgPaths.p2407a0b0} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p219c5880} fill="var(--fill-0, #F7B600)" id="Vector_2" />
          <path d={svgPaths.p3634cc00} fill="var(--fill-0, #1A1F71)" id="Vector_3" />
          <path d={svgPaths.p9db3480} fill="var(--fill-0, #1A1F71)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_74_344">
            <rect fill="white" height="64" width="115.123" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function List() {
  return (
    <div className="content-start flex flex-wrap gap-[0px_24px] items-start relative shrink-0 w-full" data-name="List">
      <Group />
      <CardsCcDinersClubSvg />
      <CardsCcJcbSvg />
      <CardsCcMasterCardSvg />
      <CardsCcVisaSvg />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading7 />
      <List />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-full items-start relative w-full max-w-[861px]" data-name="Container">
      <Container2 />
      <Container9 />
      <Container13 />
      <Container15 />
      <Container17 />
      <Container22 />
    </div>
  );
}

export default function PoliciesSection() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between p-[24px] relative rounded-[16px] shadow-[0px_0px_4px_0px_rgba(125,130,147,0.4)] size-full" data-name="Policies section">
      <div className="flex flex-row items-center self-stretch">
        <Container />
      </div>
      <div className="flex flex-row items-center self-stretch">
        <Container1 />
      </div>
    </div>
  );
}