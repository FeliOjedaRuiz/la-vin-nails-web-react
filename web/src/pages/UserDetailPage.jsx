import { useEffect, useState } from 'react';
import Layout from '../components/layouts/Layout';
import NailPhotoGalery from '../components/nails-photos/nail-photo-galery/NailPhotoGalery';
import PhotoUpload from '../components/nails-photos/photo-upload/PhotoUpload';
import UserDetail from '../components/users/user-detail/UserDetail';
import { useParams } from 'react-router-dom';
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
} from '@material-tailwind/react';
import UserProfile from '../components/users/user-profile/UserProfile';

function UserDetailPage() {
	const [reload, setReload] = useState(false);
	const [visible, setVisible] = useState(false);
	const { id } = useParams();
	const [open, setOpen] = useState(0);

	const handleOpen = (value) => setOpen(open === value ? 0 : value);

	useEffect(() => {
		setReload(!reload);
	}, []);

	const onPhotoCreation = () => {
		setReload(!reload);
	};

	const changeVisibility = () => {
		setVisible(!visible);
		console.log('visible', visible);
	};

	function Icon({ id, open }) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={2}
				stroke="currentColor"
				className={`${
					id === open ? 'rotate-180' : ''
				} h-5 w-5 transition-transform`}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19.5 8.25l-7.5 7.5-7.5-7.5"
				/>
			</svg>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center p-4">
				<UserProfile userId={id} />				
				<Accordion open={open === 2} icon={<Icon id={2} open={open} />}>
					<AccordionHeader className='text-pink-600 hover:text-pink-800 border-b-pink-50' onClick={() => handleOpen(2)}>
						Recompenzas
					</AccordionHeader>
					<AccordionBody>
						<UserDetail userId={id} />
					</AccordionBody>
				</Accordion>
				<Accordion open={open === 1} icon={<Icon id={1} open={open} />}>
					<AccordionHeader className='text-pink-600 hover:text-pink-800 border-b-pink-50' onClick={() => handleOpen(1)}>
						Galeria
					</AccordionHeader>
					<AccordionBody>
						<PhotoUpload
							userId={id}
							onPhotoCreation={onPhotoCreation}
							changeVisibility={changeVisibility}
							visible={visible}
						/>
						<NailPhotoGalery
							userId={id}
							reload={reload}
							changeVisibility={changeVisibility}
						/>
					</AccordionBody>
				</Accordion>
				<Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
					<AccordionHeader className='text-pink-600 hover:text-pink-800 border-b-pink-50' onClick={() => handleOpen(3)}>
						Configuración de cuenta
					</AccordionHeader>
					<AccordionBody>Config</AccordionBody>
				</Accordion>
			</div>
		</Layout>
	);
}

export default UserDetailPage;
