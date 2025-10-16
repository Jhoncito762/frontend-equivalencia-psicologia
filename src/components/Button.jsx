import React from 'react'

const Button = ({icon, text, onClick}) => {
    return (
        <>
            <button onClick={onClick} className='bg-[#8F141B] text-white hover:bg-[#CE932C] shadow-xl rounded-lg w-75 py-7 transform transition duration-400 hover:scale-105 flex flex-col gap-3 items-center'>
                {icon}
                {text}
            </button>
        </>
    )
}

export default Button