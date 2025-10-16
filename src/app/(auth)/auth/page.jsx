'use client'
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import React from 'react'
import { useRouter } from 'next/navigation'

const {PiStudentFill, FaChalkboardTeacher} = Icon;

const page = () => {

    const router = useRouter()

    return (
        <div className='min-h-screen w-full bg-[#EDEFF0] flex items-center justify-center'>
            <div className="bg-white w-[90%] md:w-[40%] rounded-lg shadow-md flex flex-col items-center justify-center px-5 py-10">
                <div>
                    <img src="https://www.usco.edu.co/imagen-institucional/facultades/ciencias-sociales-y-humanas.png" alt="Logo Ciencias Sociales y Humanas" />
                </div>
                <div className="flex flex-col text-center gap-2 my-15">
                    <h1 className='text-4xl text-[#4D626C] font-bold'>Sistema de Acceso</h1>
                    <p className='text-lg text-[#839198]'>Selecciona tu tipo de usuario para acceder</p>
                </div>
                <div className="flex flex-col md:flex-row w-[85%] gap-5 items-center justify-center font-semibold text-lg mb-20">
                    <Button
                        icon={<PiStudentFill size={30}/>}
                        text={"Soy Estudiante"}
                        onClick={() => {router.push('/auth/student')}}
                    />
                    <Button
                        icon={<FaChalkboardTeacher size={30}/>}
                        text={"Soy Docente"}
                        onClick={() => {router.push('/auth/teacher')}}
                    />
                    
                </div>
                <p className='text-center text-[#A6B1B6] text-lg'>Facultad de Ciencias Sociales y Humanas</p>
            </div>
        </div>
    )
}

export default page