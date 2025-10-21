'use client'
import Icon from '@/components/Icon'
import InputItem from '@/components/InputItem';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton';
import axiosPublic from '@/apis/axiosPublic';
import { useAuthStore } from '@/hooks/authStore';
import UniversityModal from '@/components/UniversityModal';

const { FaChalkboardTeacher, CiLogin, FaEye, FaEyeSlash } = Icon;

const page = () => {

    const router = useRouter();
    const setTokens = useAuthStore((state) => state.setTokens);


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [fieldErrors, setFieldErrors] = useState({
        credential: '',
        password: ''
    });
    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: '',
        onAccept: null
    });

    const [formData, setFormData] = useState({
        credential: "",
        password: "",
        remember_me: false,
    });


    useEffect(() => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (token && refreshToken) {
            try {
                jwtDecode(token);
                router.push("/dashboard");
            } catch (e) {
                // Token inválido → no redirige
            }
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (modalConfig.onAccept) {
            modalConfig.onAccept();
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const trimmedCredential = formData.credential.trim();
        const trimmedPassword = formData.password.trim();

        const newErrors = {
            credential: trimmedCredential ? '' : 'Campo obligatorio',
            password: trimmedPassword ? '' : 'Campo obligatorio'
        };

        if (!trimmedCredential || !trimmedPassword) {
            setFieldErrors(newErrors);
            return;
        }

        setLoading(true)
        try {
            const response = await axiosPublic.post(
                process.env.NEXT_PUBLIC_BACKEND_ADMIN,
                formData
            )

            const token = response.data.access_token;
            const refresh_token = response.data.refresh_token;
            setTokens(token, refresh_token);

            if (token) {
                setModalConfig({
                    type: 'success',
                    title: 'Acceso Exitoso',
                    message: 'Bienvenido profesor. Presione "Aceptar" para continuar al panel de administración.',
                    onAccept: () => router.push('/dashboard/equivalences')
                });
                setShowModal(true);
            }

        } catch (error) {
            console.error('No se pudo autenticar el profesor', error);
            
            let errorMessage = 'Credenciales incorrectas. Verifique su correo y contraseña.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Credenciales incorrectas. Verifique su correo y contraseña.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Error del servidor. Intente nuevamente más tarde.';
            } else if (!error.response) {
                errorMessage = 'Error de conexión. Verifique su conexión a internet.';
            }

            setModalConfig({
                type: 'error',
                title: 'Error de Acceso',
                message: errorMessage,
                onAccept: null
            });
            setShowModal(true);
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className='min-h-screen w-full bg-[#EDEFF0] flex items-center justify-center py-10'>

            <div className="bg-white w-[90%] md:w-[40%] rounded-lg shadow-md flex flex-col items-center justify-center px-5 py-10">
                <div className=" self-start ml-5">
                    <BackButton to={'/auth'} />
                </div>
                <div>
                    <img src="https://www.usco.edu.co/imagen-institucional/facultades/ciencias-sociales-y-humanas.png" alt="Logo Ciencias Sociales y Humanas" />
                </div>
                <div className="flex flex-col items-center my-10 gap-3">
                    <FaChalkboardTeacher className='bg-[#F4E7E8] rounded-full text-[#8F141B] p-4' size={80} />
                    <div className="flex flex-col text-center gap-4">
                        <h1 className='text-3xl text-[#4D626C] font-bold'>Acceso Profesor</h1>
                        <p className='text-sm text-[#839198]'>Ingresa tus credenciales de acceso</p>
                    </div>
                </div>
                <div className="w-[80%] flex flex-col items-center gap-4 mb-8">
                    <InputItem
                        labelName="Correo electronico"
                        placeholder="administracion@usco.edu.co"
                        type="text"
                        name="credential"
                        value={formData.credential}
                        onChange={handleInputChange}
                        error={fieldErrors.credential}
                    />
                    <div className="relative w-full flex items-center">
                        <InputItem
                            labelName="Contrasenia"
                            placeholder="Ingresa tu contrasenia"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={fieldErrors.password}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-9.5"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <FaEyeSlash className="h-5 w-5 text-gray-500" />
                            ) : (
                                <FaEye className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={formData.remember_me}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    remember_me: e.target.checked,
                                }))
                            }
                            className="accent-[#8F141B] cursor-pointer"
                        />
                        Recordarme
                    </label>

                </div>

                <button
                    type='submit'
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`bg-[#8F141B] text-white hover:bg-[#CE932C] shadow-xl rounded-lg w-[80%] py-3 transform transition duration-400 flex items-center justify-center ${loading
                        ? `cursor-not-allowed bg-[#A57623]` : ``}`}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-gray-800 rounded-full animate-spin"></div>

                    ) : (
                        <div className="flex gap-3 items-center justify-center font-semibold">
                            <CiLogin size={25} />
                            Acceder
                        </div>

                    )}
                </button>
            </div>

            <UniversityModal
                isOpen={showModal}
                onClose={handleModalClose}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>
    )
}

export default page