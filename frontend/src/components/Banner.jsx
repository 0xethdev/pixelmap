import { useState, useEffect, useContext } from 'react';
import PeriodContext from './PeriodContext';
import Marquee from 'react-fast-marquee';

const Banner = ({ isInitialLoading }) => {
    const { currentPeriodisArt, cycleEndTime } = useContext(PeriodContext);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endTime = new Date(cycleEndTime*1000);
            const difference = endTime - now;

            let timeLeft = '';

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                timeLeft = `${days}D:${hours}H:${minutes}M`;
            }
            return timeLeft;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [cycleEndTime]);

    return (
        <div className={`text-lightgrey font-connection ${isInitialLoading ? "bg-black" : "bg-offblack"} py-1 text-xs`}>
            {!isInitialLoading && (
                <Marquee autoFill='true' pauseOnHover='true' direction='left' speed={75} gradient='true' gradientColor='#303030' gradientWidth={500}>
                    {currentPeriodisArt ?
                        `/ Artistic Period Open - ends in ${timeLeft} /` :
                        `/ Voting Period Open - ends in ${timeLeft} /`
                    }
                </Marquee>
            )}
        </div>
    );
};

export default Banner;
