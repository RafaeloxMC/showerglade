import Image from "next/image";

function Footer() {
	return (
		<div className="relative w-screen bottom-0 bg-[#123b49] ">
			<div className="-bottom-12 w-full">
				<Image
					alt="footer background"
					src="/footer.png"
					width={1440}
					height={256}
					className="aspect-1140/256 object-cover w-screen bottom-0"
				/>
				<p className="absolute text-base bottom-24 text-center w-screen text-[#123b49]">
					&copy; 2026 - Made by @xvcf & @Lopa
				</p>
			</div>
		</div>
	);
}

export default Footer;
