export const convertRange = (min: number, max: number, a: number, b: number, x: number) => {
	const temp = (max - min)
	if (temp === 0) return a
	return ((b - a) * (x - min)) / temp + a
}
