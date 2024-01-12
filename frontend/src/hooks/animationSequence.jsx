
function randomColor() {
    const rangeSize = 180; // adapt as needed
    const parts = [
        Math.floor(Math.random()*256),
        Math.floor(Math.random()*rangeSize),
        Math.floor(Math.random()*rangeSize) + 256-rangeSize 
    ].sort( (a, b) => Math.random() < 0.5 );

    return parts.map( p => p.toString(16).padStart(2, "0") ).join('');
}

const createAnimation = () => {
    let time = 12000;
    let endOfInitialSeq = 30000;
    const pixelMap = {'1_1': [
        { time: 1000, color: 'white' },
        { time: 2500, color: '#0F0F0F' },
        { time: 3500, color: 'white' },
        { time: 5000, color: '#0F0F0F' },
        { time: 6000, color: 'white' },
        { time: 7500, color: '#0F0F0F' },
        { time: 8500, color: 'white' },
        { time: time, color: ('#' + randomColor())},
        { time: endOfInitialSeq, color: '#0F0F0F' }
    ]};
    
    for(let x = 1; x < 65; x++){
        let dTime = Math.floor(Math.random() * 650) +50;
        let timeUsed = time;
        for(let y = 1; y < 65; y++){
            if (x==1 && y ==1) y++;
            let randomColorUsed = '#' + randomColor();
            const key = `${x}_${y}`;
            pixelMap[key] = [{ time: timeUsed, color: randomColorUsed },{ time: endOfInitialSeq, color: '#0F0F0F' }]
            timeUsed += dTime;
            
        }
    }
    
    return pixelMap;
};

const pixelMapFinal = createAnimation();

export default pixelMapFinal