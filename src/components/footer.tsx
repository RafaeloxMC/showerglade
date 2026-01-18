import Image from "next/image";

function Footer() {
	return (
		<div>
			<div className="fixed bottom-0 w-full">
				<Image
					alt="footer background"
					src="/footer.png"
					width={1440}
					height={256}
				/>
				<p className="absolute bottom-16 text-center w-screen text-[#123b49]">
					&copy; 2026 - Made by @xvcf & @Lopa
				</p>
			</div>
		</div>
	);
}

export default Footer;
