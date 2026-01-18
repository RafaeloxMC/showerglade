import Image from "next/image";

function Footer() {
	return (
		<div className="absolute w-screen -z-10 bottom-0">
			<div className="fixed bottom-0 w-full h-64">
				<Image
					alt="footer background"
					src="/footer.png"
					width={1440}
					height={256}
					className="aspect-1140/256 object-cover w-screen bottom-0"
				/>
				<p className="absolute bottom-16 text-center w-screen text-[#123b49]">
					&copy; 2026 - Made by @xvcf & @Lopa
				</p>
			</div>
		</div>
	);
}

export default Footer;
