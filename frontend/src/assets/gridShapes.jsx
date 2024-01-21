/// shapes have the following ids:
// 0 - square
// 1 - circle
// 2 - triangle, corner up left
// 3 - triangle, corner up right
// 4 - triangle, corner bottom right
// 5 - triangle, corner bottom left
// 6 - quarter circle, corner up left
// 7 - quarter circle, corner up right
// 8 - quarter circle, corner bottom right
// 9 - quarter circle, corner bottom left


export const createShape = (i, id, width, height, x, y, color, pixel, handleMouseOver, handlePixelClick, isDimmed) => {
    const noop = () => {};
    const onMouseOver = handleMouseOver || noop;
    const onClick = handlePixelClick || noop;
    
    const dimStyle = isDimmed ? { opacity: 0.3 } : {};
    const commonProps = {
        key: i,
        style: dimStyle,
        fill:color,
        onMouseOver: (e) => onMouseOver(e, pixel),
        onClick: () => onClick(pixel)
    };

    if(id == 0){
        return <rect {...commonProps} x={`${x}`} y={`${y}`} width={`${width}`} height={`${height}`} />
    }
    if(id == 1){
        return <circle {...commonProps} cx={`${x+(width/2)}`} cy={`${y+(height/2)}`} r={`${width/2}`} />
    }
    if(id == 2){
        return <path {...commonProps} d={`M ${x} ${y} L ${x+width} ${y} L ${x} ${y+height} z`} />;
    }
    if(id == 3){
        return <path {...commonProps} d={`M ${x} ${y} L ${x+width} ${y} L ${x+width} ${y+height} z `} />;
    }
    if(id == 4){
        return <path {...commonProps} d={`M ${x+width} ${y+height} L ${x+width} ${y} L ${x} ${y+height} z`} />;
    }
    if(id == 5){
        return <path {...commonProps} d={`M ${x} ${y+height} L ${x} ${y} L ${x+width} ${y+height} z`}  />;
    }
    if(id == 6){
        return <path {...commonProps} d={`M ${x} ${y+height} A ${width} ${height} 0 0 0 ${x+width} ${y} L ${x} ${y} Z`} />
    }
    if(id == 7){
        return <path {...commonProps} d={`M ${x} ${y} A ${width} ${height} 0 0 0 ${x+width} ${y+height} L ${x+width} ${y} Z`} />
    }
    if(id == 8){
        return <path {...commonProps} d={`M ${x+width} ${y} A ${width} ${height} 0 0 0 ${x} ${y+height} L ${x+width} ${y+height} Z`} />
    }
    if(id == 9){
        return <path {...commonProps} d={`M ${x} ${y} A ${width} ${height} 0 0 1 ${x+width} ${y+height} L ${x} ${y+height} Z`} />
    }

    return null;
}