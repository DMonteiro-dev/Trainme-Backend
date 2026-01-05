import 'dotenv/config';
import dayjs from 'dayjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { UserModel } from '../models/user.model.js';
import { TrainerProfileModel } from '../models/trainerProfile.model.js';
import { ClientProfileModel } from '../models/clientProfile.model.js';
import { TrainingPlanModel } from '../models/trainingPlan.model.js';
import { SessionModel } from '../models/session.model.js';
import { ProgressLogModel } from '../models/progressLog.model.js';
import { MessageModel } from '../models/message.model.js';
import { ReviewModel } from '../models/review.model.js';

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD ?? 'Password123!';
const SAMPLE_AVATARS = {
  admin: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
  trainer: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  client: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
};

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    UserModel.deleteMany({}),
    TrainerProfileModel.deleteMany({}),
    ClientProfileModel.deleteMany({}),
    TrainingPlanModel.deleteMany({}),

    SessionModel.deleteMany({}),
    ProgressLogModel.deleteMany({}),
    MessageModel.deleteMany({}),
    ReviewModel.deleteMany({}),
  ]);

  const admin = await UserModel.create({
    name: 'TrainMe Admin',
    email: 'admin@trainme.com',
    password: DEFAULT_PASSWORD,
    role: 'admin',
    avatarUrl: SAMPLE_AVATARS.admin
  });

  const trainer = await UserModel.create({
    name: 'Inês Cardoso',
    email: 'trainer@trainme.com',
    password: DEFAULT_PASSWORD,
    role: 'trainer',
    avatarUrl: SAMPLE_AVATARS.trainer,
    status: 'active'
  });

  await TrainerProfileModel.create({
    userId: trainer._id,
    bio: 'Treinadora especializada em performance híbrida e metodologias de força funcional.',
    specialties: ['Força funcional', 'HIIT', 'Mobilidade'],
    yearsOfExperience: 8,
    pricePerSession: 45,
    location: 'Lisboa, Portugal',
    onlineSessionsAvailable: true,
    ratingAverage: 4.8,
    ratingCount: 18,
    socialLinks: ['https://instagram.com/trainwithines']
  });

  const client = await UserModel.create({
    name: 'Diego Costa',
    email: 'cliente@trainme.com',
    password: DEFAULT_PASSWORD,
    role: 'client',
    avatarUrl: SAMPLE_AVATARS.client,
    status: 'active'
  });

  await ClientProfileModel.create({
    userId: client._id,
    age: 31,
    height: 178,
    weight: 82,
    goals: 'Definir massa muscular e melhorar condicionamento',
    medicalRestrictions: 'Sensibilidade no joelho esquerdo',
    preferences: 'Treinos híbridos, 4x por semana'
  });

  const workoutPlan = await TrainingPlanModel.create({
    trainerId: trainer._id,
    clientId: client._id,
    name: 'Bloco Híbrido 8 semanas',
    frequency: 3,
    status: 'active',
    durationWeeks: 8,
    schedule: [
      {
        dayOfWeek: 1,
        label: 'Full Body',
        exercises: [
          {
            name: 'Agachamento frontal',
            sets: 4,
            reps: '6',
            instructions: 'Tempo 31X1'
          },
          {
            name: 'Remada com barra',
            sets: 4,
            reps: '8'
          },
          {
            name: 'Bike erg sprints',
            sets: 6,
            reps: '40',
            instructions: 'Mantém acima de 90 RPM'
          }
        ]
      }
    ]
  });



  const upcomingDate = dayjs().add(1, 'day');

  // Create Date objects for start/end times
  const start1 = upcomingDate.set('hour', 8).set('minute', 0).toDate();
  const end1 = upcomingDate.set('hour', 9).set('minute', 0).toDate();

  const date2 = dayjs().add(3, 'day');
  const start2 = date2.set('hour', 18).set('minute', 30).toDate();
  const end2 = date2.set('hour', 19).set('minute', 15).toDate();

  await SessionModel.create([
    {
      trainer: trainer._id,
      client: client._id,
      startTime: start1,
      endTime: end1,
      status: 'scheduled',
      notes: 'Revisão técnica e bloco de força'
    },
    {
      trainer: trainer._id,
      client: client._id,
      startTime: start2,
      endTime: end2,
      status: 'scheduled'
    }
  ]);

  await ProgressLogModel.create([
    {
      clientId: client._id,
      trainerId: trainer._id,
      date: dayjs().subtract(14, 'day').toDate(),
      weight: 82,
      bodyFatPercent: 18,
      measurements: { cintura: 86 },
      workoutPlanId: workoutPlan._id,
      notes: 'Início do bloco'
    },
    {
      clientId: client._id,
      trainerId: trainer._id,
      date: dayjs().subtract(7, 'day').toDate(),
      weight: 81.2,
      bodyFatPercent: 17.5,
      workoutPlanId: workoutPlan._id,
      notes: 'Melhor resposta na bike erg'
    }
  ]);

  await MessageModel.create([
    {
      senderId: client._id,
      receiverId: trainer._id,
      content: 'Bom dia Inês! Alguma alteração ao treino de amanhã?'
    },
    {
      senderId: trainer._id,
      receiverId: client._id,
      content: 'Olá Diego! Mantemos o plano, só ajusta o aquecimento de mobilidade.'
    }
  ]);

  await ReviewModel.create({
    authorId: client._id,
    trainerId: trainer._id,
    workoutPlanId: workoutPlan._id,
    rating: 5,
    comment: 'Sessões muito bem estruturadas e acompanhamento diário!'
  });



  console.log('\nSeed concluído com sucesso!');
  console.table([
    { perfil: 'Administrador', email: admin.email, password: DEFAULT_PASSWORD },
    { perfil: 'Treinador', email: trainer.email, password: DEFAULT_PASSWORD },
    { perfil: 'Cliente', email: client.email, password: DEFAULT_PASSWORD }
  ]);
};

seed()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
    process.exit();
  });
