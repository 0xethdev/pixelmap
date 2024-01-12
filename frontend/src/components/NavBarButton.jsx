
const NavBarButton = ({ page, selectedPage, setSelectedPage }) => {
    return (
        <button className={`${selectedPage === page ? "text-white border-white" : "text-darkgrey hover:text-white border-darkgrey hover:border-white"} py-0 px-1 w-[100px] h-[27px] border-b-2 font-connection transition duration-300 ease-in-out`} 
        onClick={() => setSelectedPage(page)}>
            {page}
        </button>
    )
} 

export default NavBarButton