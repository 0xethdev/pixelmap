import { useState, useEffect } from 'react'
import Marquee from 'react-fast-marquee'

const Banner = ({isInitialLoading}) => {
     
    return (
        <div className={`text-lightgrey font-connection ${isInitialLoading ? "bg-black" : "bg-offblack" } py-1 text-xs`} >
            {!isInitialLoading && (
            <Marquee autoFill='true' pauseOnHover='true' direction='left' speed={75} gradient='true' gradientColor='#303030' gradientWidth={500}>
                / Pixels available for claim /
            </Marquee>
            )}
        </div>
    )
}

export default Banner