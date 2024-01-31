

const ShapeLoader = ({width, height, fillColor1, fillColor2, fillColor3, fillColor4, fillColor5, fillColor6, fillColor7, fillColor8, fillColor9, fillColor10 }) => {
    
    return (
        <svg width={width} height={height} viewBox="0 0 1110 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M110 10H10V110H110V10Z" fill={fillColor1} />
            <path d="M170 110C197.614 110 220 87.6142 220 60C220 32.3858 197.614 10 170 10C142.386 10 120 32.3858 120 60C120 87.6142 142.386 110 170 110Z" fill={fillColor2} />
            <path d="M230 110V10L330 110H230Z" fill={fillColor3} />
            <path d="M340 10H440L340 110V10Z" fill={fillColor4} />
            <path d="M450 10H550V110L450 10Z" fill={fillColor5} />
            <path d="M660 110V10L560 110H660Z" fill={fillColor6} />
            <path d="M670 10C696.522 10 721.957 20.5357 740.711 39.2893C759.464 58.043 770 83.4784 770 110H670V10Z" fill={fillColor7} />
            <path d="M780 110C806.522 110 831.957 99.4643 850.711 80.7107C869.464 61.957 880 36.5216 880 10H780V110Z" fill={fillColor8} />
            <path d="M890 10C890 36.5216 900.536 61.957 919.289 80.7107C938.043 99.4643 963.478 110 990 110V10H890Z" fill={fillColor9} />
            <path d="M1100 10C1073.48 10 1048.04 20.5357 1029.29 39.2893C1010.54 58.043 1000 83.4784 1000 110H1100V10Z" fill={fillColor10} />
        </svg>
    );
};

export default ShapeLoader;
