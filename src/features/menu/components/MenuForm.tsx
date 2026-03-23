import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useCreateMenu, Menu } from '../api/menuApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import moment from 'moment';
import toast from 'react-hot-toast';

const MenuSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    serving_from: Yup.string().required('Serving from time is required'),
    serving_to: Yup.string()
        .required('Serving to time is required')
        .test('is-later', 'To time must be later than From time', function (value) {
            const { serving_from } = this.parent;
            if (!serving_from || !value) return true;

            const from = moment(serving_from, 'hh:mm A');
            const to = moment(value, 'hh:mm A');
            return to.isAfter(from);
        }),
});

interface MenuFormProps {
    title: string;
    initialValues?: Partial<Menu>;
    onSubmit?: (values: any) => Promise<void>;
    isLoading?: boolean;
}

const MenuForm = ({ title: title, initialValues: propInitialValues, onSubmit: propOnSubmit, isLoading: propIsLoading }: MenuFormProps) => {
    const navigate = useNavigate();
    const createMutation = useCreateMenu();

    const initialValues = {
        title: '',
        serving_from: '08:00 AM',
        serving_to: '11:00 AM',
        is_active: true,
        ...propInitialValues
    };

    const handleSubmit = async (values: typeof initialValues, { resetForm, setFieldError }: any) => {
        const promise = propOnSubmit ? propOnSubmit(values) : createMutation.mutateAsync(values);

        toast.promise(promise, {
            loading: propOnSubmit ? 'Updating menu...' : 'Creating menu...',
            success: propOnSubmit ? 'Menu updated successfully!' : 'Menu created successfully!',
            error: (err: any) => err.response?.data?.detail || 'Something went wrong',
        });

        try {
            await promise;
            if (!propOnSubmit) resetForm();
        } catch (error: any) {
            if (error.response?.data?.detail?.includes('already exists')) {
                setFieldError('title', 'A menu with this title already exists');
            }
        }
    };

    return (
        <Card className="h-fit">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialValues ? 'Edit menu' : 'Create new menu'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/menu')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>

            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={MenuSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form className="space-y-4">
                        <Input
                            label="Menu Title"
                            name="title"
                            placeholder="Breakfast Menu"
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.title && errors.title ? (errors.title as string) : undefined}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Serving From"
                                name="serving_from"
                                type="time"
                                step="60"
                                value={moment(values.serving_from, 'hh:mm A').format('HH:mm')}
                                onChange={(e) => {
                                    const time = moment(e.target.value, 'HH:mm').format('hh:mm A');
                                    handleChange({ target: { name: 'serving_from', value: time } });
                                }}
                                onBlur={handleBlur}
                                error={touched.serving_from && errors.serving_from ? (errors.serving_from as string) : undefined}
                                required
                            />
                            <Input
                                label="Serving To"
                                name="serving_to"
                                type="time"
                                step="60"
                                value={moment(values.serving_to, 'hh:mm A').format('HH:mm')}
                                onChange={(e) => {
                                    const time = moment(e.target.value, 'HH:mm').format('hh:mm A');
                                    handleChange({ target: { name: 'serving_to', value: time } });
                                }}
                                onBlur={handleBlur}
                                error={touched.serving_to && errors.serving_to ? (errors.serving_to as string) : undefined}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={values.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 rounded"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Active
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={createMutation.isPending || isSubmitting || propIsLoading}
                        >
                            {propOnSubmit ? 'Update Menu' : 'Create Menu'}
                        </Button>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

export default MenuForm;
