import { useCrud } from "@cool-vue/crud";
import { ElMessage } from "element-plus";
import { defineComponent, nextTick, ref, watch } from "vue";
import { isBoolean, isFunction } from "lodash-es";

export default defineComponent({
	name: "cl-switch",

	props: {
		scope: null,
		column: null,
		modelValue: [Number, String, Boolean],
		api: Function,
		activeValue: {
			type: [Number, String, Boolean],
			default: 1
		},
		inactiveValue: {
			type: [Number, String, Boolean],
			default: 0
		}
	},

	emits: ["update:modelValue", "change"],

	setup(props, { emit }) {
		// cl-crud
		const Crud = useCrud();

		// 状态
		const status = ref<boolean | number | string>();

		const activeValue = ref();
		const inactiveValue = ref();

		watch(
			() => props.modelValue,
			(val) => {
				// 首次获取类型
				if (activeValue.value === undefined) {
					if (isBoolean(props.modelValue)) {
						activeValue.value = true;
						inactiveValue.value = false;
					} else {
						activeValue.value = props.activeValue;
						inactiveValue.value = props.inactiveValue;
					}
				}

				status.value = val;
			},
			{
				immediate: true
			}
		);

		// 监听改变
		function onChange(val: boolean | string | number) {
			if (props.column && props.scope) {
				if (val !== undefined) {
					const params = {
						id: props.scope.id,
						[props.column.property]: val
					};

					const req: Promise<any> = isFunction(props.api)
						? props.api(params)
						: Crud.value?.service.update(params);

					if (req) {
						req.then(() => {
							emit("update:modelValue", val);
							emit("change", val);
							ElMessage.success("更新成功");
						}).catch((err) => {
							ElMessage.error(err.message);
						});
					}
				}
			} else {
				emit("update:modelValue", val);
				emit("change", val);
			}
		}

		// 点击事件, 阻止冒泡
		function onClick(event: MouseEvent) {
			event.stopPropagation();
		}

		return () => {
			return (
				<el-switch
					v-model={status.value}
					active-value={activeValue.value}
					inactive-value={inactiveValue.value}
					onChange={onChange}
					onClick={onClick}
				/>
			);
		};
	}
});
