import WhatsappIcon from './../../icons/WhatsappIcon';
import EmailIcon from '../../icons/EmailIcon';

function UserProfile({ user }) {
	
	const avatarUrl =	user.avatarUrl ||	'https://res.cloudinary.com/duoshgr3h/image/upload/v1736012840/la-vin-nails-web/profile-pictures/avatar-default_wnlpoe.png';

	return (
		<div className="font-semibold  max-w-[90vw] text-teal-700 overflow-hidden flex flex-col my-4 w-full md:max-w-xl p-6 bg-gradient-to-br from-emerald-100/80 via-white to-pink-50 rounded-2xl shadow-md">
			<div>
				<img
					src={avatarUrl}
					alt="Foto de perfil"
					className="w-16 h-1w-16 mx-auto rounded-full mb-2"
				/>
				<p className="text-center mb-1 text-2xl min-h-8">
					{user.name} {user.surname}
				</p>
			</div>
			<div className=''>
				<a
					href={`https://wa.me/+34${user.phone}?text=¡Hola!`}
					className="flex items-center mt-2 h-7"
				>
					<WhatsappIcon color={'#00796b'} />
					<span className="text-xl">{user.phone}</span>
				</a>
				<div className="flex items-center mt-2 h-6">
					<EmailIcon />
					<p className="text-md truncate ">{user.email}</p>
				</div>
			</div>
		</div>
	);
}

export default UserProfile;
