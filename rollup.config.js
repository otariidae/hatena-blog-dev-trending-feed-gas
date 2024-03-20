import {nodeResolve} from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import sucrase from '@rollup/plugin-sucrase';

function preventTreeShakingPlugin() {
	return {
		name: 'no-treeshaking',
		resolveId(id, importer) {
			if (!importer) {
				// let's not treeshake entry points, as we're not exporting anything in App Scripts
				return { id, moduleSideEffects: "no-treeshake" }
			}
			return null;
		}
	}
}

function removeExportStatementPlugin() {
	return {
		async renderChunk(code) {
			return code.replace(/\nexport\s+\{.*\};/g, '');
		}
	}
}

// module.exports = {
export default {
	input: "src/main.ts",
	output: {
		interop: "auto",
		dir: "dist",
		format: "esm",
	},
	plugins: [
		preventTreeShakingPlugin(),
		removeExportStatementPlugin(),
		nodeResolve(),
		commonjs(),
		sucrase({
			transforms: ['typescript']
		})
	]
}
